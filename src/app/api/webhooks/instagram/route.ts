import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { dmQueue, commentQueue } from '@/lib/queue/queues';
import { hasCommentBeenProcessed, markCommentProcessed, isCommentProcessed, getRandomDelay, getSpacedDelay, getCommenterDelayMs } from '@/lib/queue/dedup';
import { getUserFromIGCache, setUserIGCache } from '@/lib/queue/user_cache';
import { safeDecrypt } from '@/lib/crypto';
import { redis } from '@/lib/queue/redis';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// GET: Meta webhook verification handshake
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token && VERIFY_TOKEN) {
      const tokenBuffer = Buffer.from(token, 'utf8');
      const verifyBuffer = Buffer.from(VERIFY_TOKEN, 'utf8');
      
      if (tokenBuffer.length === verifyBuffer.length && crypto.timingSafeEqual(tokenBuffer, verifyBuffer)) {
        console.log('[Webhook] ✅ VERIFIED');
        return new NextResponse(challenge, { status: 200 });
      } else {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }
  return new NextResponse('Bad Request', { status: 400 });
}

// Helper: Find user by any Instagram ID format
async function findUserByInstagramId(igId: string) {
  // 0. Fast path: check Redis cache first
  const cachedUser = await getUserFromIGCache(igId);
  if (cachedUser) {
    console.log(`[Webhook] Fast lookup: Found IG ID ${igId} in Redis cache (User: ${cachedUser.id})`);
    return cachedUser;
  }

  // HIGH-1 FIX: Direct DB lookup before expensive parallel Graph API calls
  const { data: directUser } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .eq('instagramUserId', igId)
    .maybeSingle();
  if (directUser) {
    console.log(`[Webhook] Direct DB match: Found IG ID ${igId} in users table (User: ${directUser.id})`);
    const resolved = {
      id: directUser.id,
      instagramUserId: directUser.instagramUserId,
      instagramAccessToken: safeDecrypt(directUser.instagramAccessToken),
      plan: directUser.plan,
      primaryInstagramUserId: directUser.instagramUserId,
    };
    await setUserIGCache(igId, resolved as any);
    return resolved;
  }
  const { data: directConn } = await supabase
    .from('connected_accounts')
    .select('user_id, instagram_user_id, instagram_access_token')
    .eq('instagram_user_id', igId)
    .maybeSingle();
  if (directConn) {
    const { data: parentUser } = await supabase
      .from('users')
      .select('id, instagramUserId, plan')
      .eq('id', directConn.user_id)
      .maybeSingle();
    console.log(`[Webhook] Direct DB match: Found IG ID ${igId} in connected_accounts (User: ${directConn.user_id})`);
    const resolved = {
      id: directConn.user_id,
      instagramUserId: directConn.instagram_user_id,
      instagramAccessToken: safeDecrypt(directConn.instagram_access_token),
      plan: parentUser?.plan || 'FREE',
      primaryInstagramUserId: parentUser?.instagramUserId || null,
    };
    await setUserIGCache(igId, resolved as any);
    return resolved;
  }

  // Fallback: Fetch all credentials and verify via Graph API (existing behavior)
  // 1. Fetch all primary credentials from users table
  const { data: users } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .not('instagramAccessToken', 'is', null);

  // 2. Fetch all extra credentials from connected_accounts table
  const { data: conns } = await supabase
    .from('connected_accounts')
    .select('user_id, instagram_user_id, instagram_access_token');

  // Build a list of unique account credentials to check
  const accountsToVerify = [];

  if (users) {
    for (const u of users) {
      accountsToVerify.push({
        userId: u.id,
        instagramUserId: u.instagramUserId,
        instagramAccessToken: safeDecrypt(u.instagramAccessToken),
        plan: u.plan,
        primaryInstagramUserId: u.instagramUserId,
        source: 'primary'
      });
    }
  }

  if (conns) {
    for (const c of conns) {
      const userPlan = users?.find(u => u.id === c.user_id)?.plan || 'FREE';
      const primaryId = users?.find(u => u.id === c.user_id)?.instagramUserId || null;

      accountsToVerify.push({
        userId: c.user_id,
        instagramUserId: c.instagram_user_id,
        instagramAccessToken: safeDecrypt(c.instagram_access_token),
        plan: userPlan,
        primaryInstagramUserId: primaryId,
        source: 'connected_account'
      });
    }
  }

  console.log(`[Webhook] Verifying owners for IG ID ${igId} across ${accountsToVerify.length} connected accounts...`);

  // 3. Try to verify which token owns the webhook's igId (Business ID)
  // by calling Graph API /me endpoint for each token in PARALLEL with a timeout
  console.log(`[Webhook] Verifying owners for IG ID ${igId} across ${accountsToVerify.length} connected accounts...`);
  
  const verifyAccount = async (acc: any) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout per request
      
      // Use Bearer token to prevent logging token in URL
      const res = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=user_id,id`, {
          headers: { Authorization: `Bearer ${acc.instagramAccessToken}` },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      
      if (!res.ok) return null;
      const data: any = await res.json();
      
      if (
        data.user_id === igId || 
        data.id === igId || 
        String(data.user_id) === igId || 
        String(data.id) === igId
      ) {
        return acc;
      }
    } catch (e) {
      console.warn(`[Webhook] Failed to verify token for connection ${acc.instagramUserId}:`, e instanceof Error ? e.message : 'Unknown error');
    }
    return null;
  };

  const results = await Promise.all(accountsToVerify.map(verifyAccount));
  const matchedAcc = results.find(acc => acc !== null);

  if (matchedAcc) {
    console.log(`[Webhook] Verified user ${matchedAcc.userId} owns IG ID ${igId} via Graph API connection (@${matchedAcc.instagramUserId})`);
    const resolvedUser = {
      id: matchedAcc.userId,
      instagramUserId: matchedAcc.instagramUserId, 
      instagramAccessToken: matchedAcc.instagramAccessToken,
      plan: matchedAcc.plan,
      primaryInstagramUserId: matchedAcc.primaryInstagramUserId,
    };
    await setUserIGCache(igId, resolvedUser as any);
    return resolvedUser;
  }

  // 4. Fallback: if we couldn't verify, try exact match on ID
  const exactUser = users?.find(u => u.instagramUserId === igId);
  if (exactUser) {
    const resolvedUser = {
      ...exactUser,
      instagramAccessToken: safeDecrypt(exactUser.instagramAccessToken),
      primaryInstagramUserId: exactUser.instagramUserId,
    };
    await setUserIGCache(igId, resolvedUser as any);
    return resolvedUser;
  }

    const exactConn = conns?.find(c => c.instagram_user_id === igId);
    if (exactConn) {
      const parentUser = users?.find(u => u.id === exactConn.user_id);
      const resolvedUser = {
        id: exactConn.user_id,
        instagramUserId: exactConn.instagram_user_id,
        instagramAccessToken: safeDecrypt(exactConn.instagram_access_token),
        plan: parentUser?.plan || 'FREE',
        primaryInstagramUserId: parentUser?.instagramUserId || null,
      };
    await setUserIGCache(igId, resolvedUser as any);
    return resolvedUser;
  }

  return null;
}

// POST: Real-time Instagram event processing
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const bodyText = await req.text();

    // Logging of raw payload has been securely moved AFTER HMAC validation

    // Verify payload signature — MANDATORY (never skip)
    if (!APP_SECRET || !signature) {
      console.error('[Webhook] ❌ Missing APP_SECRET or signature header — rejecting');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', APP_SECRET)
      .update(bodyText)
      .digest('hex')}`;

    try {
      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        console.error('[Webhook] ❌ Signature mismatch');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    } catch {
      console.error('[Webhook] ❌ Signature comparison error');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    console.log('[Webhook] ✅ Signature verified');

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      console.error('[Webhook] ❌ Failed to parse JSON body after signature verification');
      return new NextResponse('OK', { status: 200 }); // Return 200 to stop Meta from retrying
    }

    // Securely log payload only AFTER cryptographic validation
    console.log('[Webhook] ===== VALIDATED INCOMING EVENT =====');
    console.log('[Webhook] Object:', payload.object);
    console.log('[Webhook] Entries:', payload.entry?.length);
    for (const entry of (payload.entry || [])) {
      console.log(`[Webhook] Entry ID: ${entry.id}, Time: ${entry.time}`);
      
      // HIGH-2 + MED-2 FIX: Reduced from 300s to 90s (industry standard), using >= for correct boundary
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (entry.time && (nowSeconds - entry.time >= 90)) {
         console.warn(`[Webhook] ❌ Rejecting stale webhook entry to prevent replay attack. Entry time: ${entry.time}, Now: ${nowSeconds}`);
         return new NextResponse('OK', { status: 200 }); // Return 200 to ack it but don't process
      }

      if (entry.changes) {
        for (const change of entry.changes) {
          console.log(`[Webhook]   Change field: ${change.field}`, JSON.stringify(change.value));
        }
      }
      if (entry.messaging) {
        console.log(`[Webhook]   Messaging events: ${entry.messaging.length}`);
      }
    }

    if (payload.object === 'instagram') {
      for (const entry of payload.entry) {

        // === COMMENT EVENTS ===
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              const commentData = change.value;
              const igUserId = entry.id;
              const commentText = commentData.text?.toLowerCase() || '';
              const commenterId = commentData.from?.id;
              const commenterUsername = commentData.from?.username;
              const commentId = commentData.id;
              const mediaId = commentData.media?.id;
              const parentId = commentData.parent_id; // only present on reply-comments

              console.log(`[Webhook] 💬 Comment: "${commentText}" | From: ${commenterId} (${commenterUsername || 'N/A'}) | CommentID: ${commentId} | MediaID: ${mediaId} | ParentID: ${parentId || 'none'} | EntryID: ${igUserId}`);

              // Skip reply-comments — Private Reply API only works on top-level comments
              // Also skips our own bot auto-replies being echo'd back
              if (parentId) {
                console.log(`[Webhook] ⏩ Skipping reply-comment (parentId: ${parentId}) — Private Reply only works on top-level comments`);
                continue;
              }

              // Read-only deduplication check — does NOT claim the key yet.
              // Key is only claimed AFTER the job is successfully enqueued (below),
              // so a failed enqueue never permanently silences a comment.
              if (await hasCommentBeenProcessed(commentId)) {
                console.log(`[Webhook] ⏩ Skipping duplicate comment (commentId: ${commentId})`);
                continue;
              }

              const user = await findUserByInstagramId(igUserId);

              if (!user) {
                console.warn(`[Webhook] ❌ No user found for IG ID: ${igUserId}`);
                continue;
              }

              console.log(`[Webhook] ✅ Matched user: ${user.id}`);

              const { data: automations } = await supabase
                .from('automations')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true);

              console.log(`[Webhook] Found ${automations?.length || 0} active automations for user`);

              if (!automations || automations.length === 0) continue;

              for (const automation of automations) {
                // Ensure the automation belongs to the correct account
                const targetAccount = automation.instagram_user_id || (user as any).primaryInstagramUserId || user.instagramUserId;
                if (targetAccount && targetAccount !== user.instagramUserId) {
                  console.log(`[Webhook] Skipping automation ${automation.id}: belongs to account ${targetAccount}, event is for matched connection ${user.instagramUserId}`);
                  continue;
                }

                // Check if this automation applies to this media post
                // instagram_media_id can be a comma-separated list or empty (= all posts)
                const targetMediaIds = automation.instagram_media_id
                  ? automation.instagram_media_id.split(',').map((s: string) => s.trim()).filter(Boolean)
                  : [];
                
                // If automation targets specific posts, check if this comment is on one of them
                if (targetMediaIds.length > 0 && mediaId && !targetMediaIds.includes(mediaId)) {
                  console.log(`[Webhook] Skipping automation ${automation.id}: media ${mediaId} not in target list [${targetMediaIds.join(', ')}]`);
                  continue;
                }

                // Ensure the event matches the automation's requested trigger context
                // Skip any non-post automations (story/dm handle their own triggers)
                if (automation.target_type !== 'post') continue;

                const keywords: string[] = Array.isArray(automation.keywords)
                  ? automation.keywords
                  : JSON.parse(automation.keywords || '[]');
                
                // Strip surrounding quotes from keywords (defensive: handles DB entries saved with e.g. "Link" instead of Link)
                const cleanedKeywords = keywords.map((kw: string) => kw.trim().replace(/^["']|["']$/g, ''));
                
                // Empty keywords = match ALL comments
                const matched = cleanedKeywords.length === 0 || cleanedKeywords.some((kw: string) => commentText.toLowerCase().includes(kw.toLowerCase()));

                console.log(`[Webhook] Automation ${automation.id}: keywords=[${keywords.join(',')}], commentText="${commentText}", matched=${matched}`);

                if (matched) {
                  console.log(`[Webhook] 🎯 ${keywords.length === 0 ? 'All-comments mode' : 'Keyword MATCHED'}! Dispatching jobs for automation: ${automation.id}`);

                  // 24-HOUR COMMENTER COOLDOWN (Rolling Queue)
                  let commenterDelayMs = 0;
                  if (commenterId) {
                    commenterDelayMs = await getCommenterDelayMs(user.id, commenterId);
                    if (commenterDelayMs > 0) {
                      console.log(`[Webhook] 🕒 Commenter ${commenterId} is in cooldown. Queuing job with ${commenterDelayMs}ms delay.`);
                    }
                  }

                  try {
                    await supabase.from('analytics_events').insert({
                      user_id: user.id,
                      event_type: 'comment_matched',
                      metadata: { automation_id: automation.id, comment_id: commentId, keyword: keywords.length === 0 ? '*' : keywords.find(kw => commentText.includes(kw.toLowerCase().trim())), commenter_id: commenterId, commenter_username: commenterUsername, media_id: mediaId }
                    });
                  } catch (e) { console.error('[Webhook] Analytics insert error:', e); }

                  // Dispatch: Reply to comment publicly, DM chains from the comment worker
                  try {
                    // MED-1 FIX: Claim dedup key BEFORE enqueue to prevent race condition
                    const claimed = await markCommentProcessed(commentId);
                    if (!claimed) {
                      console.log('[Webhook] ⏩ Duplicate claim — another webhook already processing this comment');
                      continue;
                    }
                    await commentQueue.add('reply', {
                      userId: user.id,
                      automationId: automation.id,
                      commentId: commentId,
                      recipientId: commenterId,
                      commenterUsername,
                      mediaId: mediaId,
                    }, { 
                      delay: (await getSpacedDelay(user.id, 'comment', 6000)) + commenterDelayMs,
                      attempts: 12,
                      backoff: {
                        type: 'nextHour',
                      }
                    });
                    console.log('[Webhook] ✅ Comment reply job queued');
                  } catch (e) {
                    // MED-1: Release dedup key if enqueue failed so comment can be retried
                    await redis.del(`processed_comment:${commentId}`);
                    console.error('[Webhook] Comment queue error:', e);
                  }

                  // IMPORTANT: Only trigger ONE automation per comment to prevent duplicate DMs
                  break;
                }
              }
            }
          }
        }

        // === DM MESSAGE EVENTS (Quick Replies + Lead Capture + AI) ===
        if (entry.messaging) {
          for (const messageEvent of entry.messaging) {
            const senderId = messageEvent.sender?.id;
            const messageText = messageEvent.message?.text;
            const quickReplyPayload = messageEvent.message?.quick_reply?.payload || messageEvent.postback?.payload;
            const igUserId = entry.id;

            if (!senderId) continue;

            // Skip echo messages (messages sent BY the page itself)
            if (messageEvent.message?.is_echo) continue;

            const isStoryReply = !!messageEvent.message?.reply_to?.story;
            console.log(`[Webhook] 📩 DM from ${senderId}: "${messageText}" | QR: ${quickReplyPayload || 'none'} | Story: ${isStoryReply}`);

            const user = await findUserByInstagramId(igUserId);

            if (!user) {
              console.warn(`[Webhook] ❌ No user found for IG ID (DM): ${igUserId}`);
              continue;
            }

            // ---- STORY AUTOMATION TRIGGER (checked FIRST so it can't be hijacked) ----
            if (isStoryReply && messageText) {
              console.log(`[Webhook] 📖 Story reply detected: "${messageText}"`);
              if (user.plan === 'FREE') {
                console.log(`[Webhook] Skipping story: Pro feature, user is FREE`);
              } else {
                const { data: storyAutomations } = await supabase
                  .from('automations')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('is_active', true)
                  .eq('target_type', 'story');

                console.log(`[Webhook] Found ${storyAutomations?.length || 0} story automations`);
                if (storyAutomations && storyAutomations.length > 0) {
                  let storyMatched = false;
                  for (const automation of storyAutomations) {
                    // Ensure the automation belongs to the correct account
                    const targetAccount = automation.instagram_user_id || (user as any).primaryInstagramUserId || user.instagramUserId;
                    if (targetAccount && targetAccount !== user.instagramUserId) {
                      continue;
                    }

                    const keywords: string[] = Array.isArray(automation.keywords) ? automation.keywords : JSON.parse(automation.keywords || '[]');
                    const cleanMsg = messageText.toLowerCase().replace(/[^\w\s\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/g, '').trim();
                    const matched = keywords.length === 0 || keywords.some(kw => {
                      const cleanKw = kw.toLowerCase().replace(/[^\w\s\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/g, '').trim();
                      return cleanMsg === cleanKw;
                    });
                    if (matched) {
                      storyMatched = true;
                      console.log(`[Webhook] 🎯 Story keyword match! automation: ${automation.id}`);
                      
                      try {
                        await dmQueue.add('send', {
                          userId: user.id,
                          automationId: automation.id,
                          recipientId: senderId,
                          commenterUsername: 'follower',
                        }, { delay: await getSpacedDelay(user.id, 'dm', 6000) });
                        console.log(`[Webhook] ✅ Story DM job queued with delay`);
                      } catch (e) { console.error('[Webhook] Story DM queue error:', e); }
                      break;
                    }
                  }
                  if (storyMatched) continue;
                }
              }
            }

            // ---- QUICK REPLY: "Send me the link" ----
            if (quickReplyPayload === 'GET_LINK') {
              const { data: convo } = await supabase
                .from('dm_conversations')
                .select('automation_id')
                .eq('user_id', user.id)
                .eq('recipient_ig_id', senderId)
                .not('automation_id', 'is', null)
                .eq('state', 'awaiting_link_tap')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (convo) {
                try {
                  await dmQueue.add('button-response', {
                    userId: user.id,
                    automationId: convo.automation_id,
                    recipientId: senderId,
                    quickReplyPayload,
                  });
                  console.log('[Webhook] ✅ Button-response job queued');
                } catch (e) { console.error('[Webhook] Button-response queue error:', e); }
              }
              continue;
            }

            // ---- QUICK REPLY: "I'm Following" ----
            if (quickReplyPayload === 'FOLLOWING') {
              const { data: convo } = await supabase
                .from('dm_conversations')
                .select('automation_id')
                .eq('user_id', user.id)
                .eq('recipient_ig_id', senderId)
                .not('automation_id', 'is', null)
                .eq('state', 'awaiting_follow')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (convo) {
                try {
                  await dmQueue.add('follow-verify', {
                    userId: user.id,
                    automationId: convo.automation_id,
                    recipientId: senderId,
                  });
                  console.log('[Webhook] ✅ Follow-verify job queued');
                } catch (e) { console.error('[Webhook] Follow-verify queue error:', e); }
              }
              continue;
            }

            // ---- QUICK REPLY: "Visit Profile" (informational, no action needed) ----
            if (quickReplyPayload === 'VISIT_PROFILE') {
              continue;
            }

            // ---- PLAIN TEXT: Handle typed responses as button-tap equivalents ----
            if (messageText && !quickReplyPayload) {
              const normalizedText = messageText.trim().toLowerCase();
              const matchRegex = /\b(yes|yeah|yep|yup|send|link|access|please)\b/i;

              // Check if user typed "yes", "send", "link", etc. while awaiting button tap
              if (matchRegex.test(messageText)) {
                const { data: convo } = await supabase
                  .from('dm_conversations')
                  .select('automation_id')
                  .eq('user_id', user.id)
                  .eq('recipient_ig_id', senderId)
                  .eq('state', 'awaiting_link_tap')
                  .order('updated_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (convo) {
                  try {
                    await dmQueue.add('button-response', {
                      userId: user.id,
                      automationId: convo.automation_id,
                      recipientId: senderId,
                      quickReplyPayload: 'GET_LINK',
                    });
                    console.log('[Webhook] ✅ Text "yes" → button-response job queued');
                  } catch (e) { console.error('[Webhook] Text button-response queue error:', e); }
                  continue;
                }
              }

              // Check if user typed "following", "i'm following", etc. while awaiting follow
              const followRegex = /\b(following|followed|follow|done)\b/i;
              if (followRegex.test(messageText)) {
                const { data: convo } = await supabase
                  .from('dm_conversations')
                  .select('automation_id')
                  .eq('user_id', user.id)
                  .eq('recipient_ig_id', senderId)
                  .eq('state', 'awaiting_follow')
                  .order('updated_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (convo) {
                  try {
                    await dmQueue.add('follow-verify', {
                      userId: user.id,
                      automationId: convo.automation_id,
                      recipientId: senderId,
                    });
                    console.log('[Webhook] ✅ Text "following" → follow-verify job queued');
                  } catch (e) { console.error('[Webhook] Text follow-verify queue error:', e); }
                  continue;
                }
              }
            }

            // ---- PLAIN TEXT: Check if we're awaiting lead data ----
            if (messageText) {
              const { data: convo } = await supabase
                .from('dm_conversations')
                .select('automation_id')
                .eq('user_id', user.id)
                .eq('recipient_ig_id', senderId)
                .not('automation_id', 'is', null)
                .eq('state', 'awaiting_lead')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (convo) {
                try {
                  await dmQueue.add('lead-reply', {
                    userId: user.id,
                    automationId: convo.automation_id,
                    recipientId: senderId,
                    messageText: messageText,
                  });
                  console.log('[Webhook] ✅ Lead-reply job queued');
                } catch (e) { console.error('[Webhook] Lead-reply queue error:', e); }
                continue;
              }

              // Story automation already handled at top of message handler (before text handlers)

              // ---- DM KEYWORD AUTOMATION TRIGGER ----
              // Fires ONLY when:
              //   1. The connected account owner is on PRO or ELITE plan
              //   2. They have explicitly created a 'dm' type automation
              //   3. The incoming message is plain text (not a quick reply, not a story reply)
              //   4. No existing conversation handler already processed this message
              if (messageText && !quickReplyPayload && !isStoryReply && (user.plan === 'PRO' || user.plan === 'ELITE')) {
                const { data: dmKeywordAutomations } = await supabase
                  .from('automations')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('is_active', true)
                  .eq('target_type', 'dm');

                if (dmKeywordAutomations && dmKeywordAutomations.length > 0) {
                  const normalizedMsg = messageText.toLowerCase().trim();
                  for (const automation of dmKeywordAutomations) {
                    // Ensure the automation belongs to the correct account
                    const targetAccount = automation.instagram_user_id || (user as any).primaryInstagramUserId || user.instagramUserId;
                    if (targetAccount && targetAccount !== user.instagramUserId) {
                      continue;
                    }

                    const keywords: string[] = Array.isArray(automation.keywords)
                      ? automation.keywords
                      : JSON.parse(automation.keywords || '[]');

                    const cleanMsg = normalizedMsg.replace(/[^\w\s]/g, '').trim();
                    const matched = keywords.length === 0 || keywords.some((kw: string) => {
                      const cleanKw = kw.toLowerCase().replace(/[^\w\s]/g, '').trim();
                      return cleanMsg === cleanKw;
                    });

                    if (matched) {
                      console.log(`[Webhook] 📩 DM keyword match! automation: ${automation.id}`);

                      try {
                        await supabase.from('analytics_events').insert({
                          user_id: user.id,
                          event_type: 'dm_keyword_matched',
                          metadata: { sender_id: senderId, keyword: keywords.length === 0 ? '*' : keywords.find((kw: string) => normalizedMsg.includes(kw.toLowerCase().trim())) }
                        });
                      } catch (e) { console.error('[Webhook] DM keyword analytics error:', e); }

                      try {
                        await dmQueue.add('send', {
                          userId: user.id,
                          automationId: automation.id,
                          recipientId: senderId,
                          commenterUsername: 'dm_user',
                        }, { delay: await getSpacedDelay(user.id, 'dm', 6000) });
                        console.log(`[Webhook] ✅ DM job queued for user ${user.id} -> ${senderId}`);
                      } catch (e) { console.error('[Webhook] DM keyword queue error:', e); }

                      break; // Only trigger one automation per DM
                    }
                  }
                }
              }

              // ---- Email detection (legacy fallback for non-conversational capture) ----
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(messageText.trim())) {
                console.log(`[Webhook] Lead captured (legacy): ${messageText.trim()}`);
                await supabase.from('leads').insert({
                  user_id: user.id,
                  instagram_username: senderId,
                  lead_type: 'email',
                  lead_value: messageText.trim(),
                  captured_at: new Date().toISOString()
                });

                await supabase.from('analytics_events').insert({
                  user_id: user.id,
                  event_type: 'lead_captured',
                  metadata: { email: messageText.trim(), sender_id: senderId }
                });
              }

              // ---- Elite AI ----
              if (user.plan === 'ELITE') {
                const { data: aiAutomations } = await supabase
                  .from('automations')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('is_active', true)
                  .eq('ai_enabled', true);

                if (aiAutomations && aiAutomations.length > 0) {
                  const matchingAiAutomation = aiAutomations.find(automation => {
                    const targetAccount = automation.instagram_user_id || (user as any).primaryInstagramUserId || user.instagramUserId;
                    return !targetAccount || targetAccount === user.instagramUserId;
                  });

                  if (matchingAiAutomation) {
                    try {
                      await dmQueue.add('ai-reply', {
                        userId: user.id,
                        automationId: matchingAiAutomation.id,
                        recipientId: senderId,
                        messageText: messageText,
                      });
                      console.log('[Webhook] ✅ AI-reply job queued');
                    } catch (e) { console.error('[Webhook] AI DM queue error:', e); }
                  }
                }
              }
            }
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('[Webhook] ❌ Processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
