import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { dmQueue, commentQueue } from '@/lib/queue/queues';
import { isCommentProcessed, getRandomDelay } from '@/lib/queue/dedup';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// GET: Meta webhook verification handshake
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook] ✅ VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  return new NextResponse('Bad Request', { status: 400 });
}

// Helper: Find user by any Instagram ID format
async function findUserByInstagramId(igId: string) {
  // Try exact match first
  const { data: user } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .eq('instagramUserId', igId)
    .maybeSingle();

  if (user) return user;

  // If no exact match, the webhook might send a different ID format.
  // Try fetching ALL users with an instagram connection and see if any match.
  // This handles the case where:
  //   - webhook sends Business Account ID (17841...)  
  //   - DB stores Instagram Login API user ID (26360...)
  // In a small user base, this is fine. For scale, we'd store both IDs.
  console.log(`[Webhook] No exact match for IG ID ${igId}, trying all connected users...`);
  
  const { data: users } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .not('instagramAccessToken', 'is', null);

  if (users && users.length > 0) {
    // For dev/small scale: if there's exactly one connected user, use them
    // For production: we'd verify by calling the Graph API with their token
    if (users.length === 1) {
      console.log(`[Webhook] Found single connected user: ${users[0].id} (IG: ${users[0].instagramUserId})`);
      return users[0];
    }

    // Multiple users: try to verify which user owns this webhook event
    // by checking if the igId matches their page/business account
    for (const u of users) {
      try {
        const res = await fetch(
          `https://graph.instagram.com/v21.0/me?fields=user_id,id&access_token=${u.instagramAccessToken}`
        );
        const data = await res.json();
        // The /me endpoint returns the user's app-scoped ID; check if the
        // webhook's entry.id matches either the user_id or id from /me
        if (data.user_id === igId || data.id === igId || String(data.user_id) === igId || String(data.id) === igId) {
          console.log(`[Webhook] Verified user ${u.id} owns IG ID ${igId} via Graph API`);
          return u;
        }
      } catch (e) {
        console.warn(`[Webhook] Failed to verify user ${u.id}:`, e);
      }
    }

    // Last resort for development: use the most recently connected user
    console.warn(`[Webhook] Could not verify owner of IG ID ${igId}, using first connected user as fallback`);
    return users[0];
  }

  return null;
}

// POST: Real-time Instagram event processing
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const bodyText = await req.text();

    // Log the raw payload for debugging
    console.log('[Webhook] ===== INCOMING EVENT =====');
    console.log('[Webhook] Signature:', signature ? 'present' : 'MISSING');
    
    try {
      const parsed = JSON.parse(bodyText);
      console.log('[Webhook] Object:', parsed.object);
      console.log('[Webhook] Entries:', parsed.entry?.length);
      for (const entry of (parsed.entry || [])) {
        console.log(`[Webhook] Entry ID: ${entry.id}, Time: ${entry.time}`);
        if (entry.changes) {
          for (const change of entry.changes) {
            console.log(`[Webhook]   Change field: ${change.field}`, JSON.stringify(change.value));
          }
        }
        if (entry.messaging) {
          console.log(`[Webhook]   Messaging events: ${entry.messaging.length}`);
        }
      }
    } catch { /* parsing for debug only */ }

    // Verify payload signature
    if (APP_SECRET && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', APP_SECRET)
        .update(bodyText)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        console.error('[Webhook] ❌ Signature mismatch');
        return new NextResponse('Unauthorized', { status: 401 });
      }
      console.log('[Webhook] ✅ Signature verified');
    }

    const payload = JSON.parse(bodyText);

    if (payload.object === 'instagram') {
      for (const entry of payload.entry) {

        // === COMMENT & LIVE EVENTS ===
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments' || change.field === 'live_comments') {
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

              // Deduplication Check
              if (await isCommentProcessed(commentId)) {
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
                if (change.field === 'live_comments') {
                  if (automation.target_type !== 'live') continue;
                  if (user.plan === 'FREE') {
                    console.log(`[Webhook] Skipping live automation ${automation.id}: Pro feature restricted for Free user ${user.id}`);
                    continue;
                  }
                }
                if (change.field === 'comments' && automation.target_type !== 'post') continue;

                const keywords: string[] = Array.isArray(automation.keywords)
                  ? automation.keywords
                  : JSON.parse(automation.keywords || '[]');
                
                // Empty keywords = match ALL comments
                const matched = keywords.length === 0 || keywords.some(kw => commentText.toLowerCase().includes(kw.toLowerCase().trim()));

                console.log(`[Webhook] Automation ${automation.id}: keywords=[${keywords.join(',')}], commentText="${commentText}", matched=${matched}`);

                if (matched) {
                  console.log(`[Webhook] 🎯 ${keywords.length === 0 ? 'All-comments mode' : 'Keyword MATCHED'}! Dispatching jobs for automation: ${automation.id}`);

                  try {
                    await supabase.from('analytics_events').insert({
                      user_id: user.id,
                      event_type: 'comment_matched',
                      metadata: { comment_id: commentId, keyword: keywords.length === 0 ? '*' : keywords.find(kw => commentText.includes(kw.toLowerCase().trim())), commenter_id: commenterId, media_id: mediaId }
                    });
                  } catch (e) { console.error('[Webhook] Analytics insert error:', e); }

                  // Dispatch: Reply to comment publicly (Only for standard posts, not lives)
                  // ANTI-BAN: Comment reply is enqueued with random delay (5-45s)
                  // DM is NO LONGER dispatched here — it chains from the comment worker after success
                  if (change.field === 'comments') {
                    try {
                      await commentQueue.add('reply', {
                        userId: user.id,
                        automationId: automation.id,
                        commentId: commentId,
                        recipientId: commenterId,
                        commenterUsername,
                      }, { delay: getRandomDelay(5000, 7200000) });
                      console.log('[Webhook] ✅ Comment reply job queued with random delay (DM will chain after success)');
                    } catch (e) { console.error('[Webhook] Comment queue error:', e); }
                  } else {
                    // Live comments don't get public replies — dispatch DM directly with delay
                    try {
                      await dmQueue.add('send', {
                        userId: user.id,
                        automationId: automation.id,
                        recipientId: commenterId,
                        commenterUsername,
                        commentId: commentId,
                      }, { delay: getRandomDelay(5000, 7200000) });
                      console.log('[Webhook] ✅ Live comment DM job queued with delay');
                    } catch (e) { console.error('[Webhook] Live DM queue error:', e); }
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
                        }, { delay: getRandomDelay(5000, 7200000) });
                        console.log('[Webhook] ✅ Story DM job queued with delay');
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

              // Check if user typed "yes", "send", "link", etc. while awaiting button tap
              if (['yes', 'yeah', 'send', 'link', 'send me the access', 'access', 'get link'].includes(normalizedText)) {
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
              if (['following', "i'm following", 'im following', 'followed', 'i follow', 'done'].includes(normalizedText)) {
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
                const { data: aiAutomation } = await supabase
                  .from('automations')
                  .select('*')
                  .eq('user_id', user.id)
                  .eq('is_active', true)
                  .eq('ai_enabled', true)
                  .limit(1)
                  .maybeSingle();

                if (aiAutomation) {
                  try {
                    await dmQueue.add('ai-reply', {
                      userId: user.id,
                      automationId: aiAutomation.id,
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
      // Keep the serverless function alive so BullMQ worker can process queued jobs.
      // Without this, Vercel freezes the process immediately after responding and
      // the worker never picks up the job.
      after(async () => {
        console.log('[Webhook] after() → keeping alive for worker processing...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('[Webhook] after() → done.');
      });

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('[Webhook] ❌ Processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
