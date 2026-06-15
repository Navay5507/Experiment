import { Worker, Job } from 'bullmq';
import { redis, createRedisConnection } from './redis';
import { supabase } from '../supabase';
import { OpenAIProvider } from '../ai/openai';
import { validateLeadField, getLeadPromptMessage } from '../validators';
import { InstagramAPI } from '../instagram/api';
import { spinCommentReply, spinDMGreeting } from '../instagram/reply-spinner';
import { isDMSentToUser, checkHourlyDMLimit, checkHourlyCommentLimit, getRandomDelay, getDMRestrictionTTL } from './dedup';
import { dmQueue, commentQueue } from './queues';
// =============================================
// JOB INTERFACES
// =============================================
interface AutomationJob {
  userId: string;
  automationId: string;
  recipientId: string;
  commentId?: string;
  messageText?: string;
  quickReplyPayload?: string;
  commenterUsername?: string;
  skipDedup?: boolean;
}

// =============================================
// INSTAGRAM MESSAGE HELPERS
// =============================================
async function sendTextDM(token: string, recipientId: string, text: string) {
  return InstagramAPI.sendDM(recipientId, text, token);
}

/**
 * Send a Private Reply to a commenter. Uses comment_id in recipient.
 * Private Reply ONLY supports plain TEXT messages.
 */
async function sendPrivateReply(token: string, commentId: string, text: string) {
  console.log(`[Worker] Sending Private Reply (text-only) to comment ${commentId}`);
  return InstagramAPI.sendPrivateReply(commentId, text, token);
}

function getRedirectUrl(automationId: string, index?: number): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://autodrop.in';
  const baseUrl = envUrl.includes('ngrok-free.dev') ? 'https://autodrop.in' : envUrl;
  return `${baseUrl}/r/${automationId}${index !== undefined ? `?i=${index}` : ''}`;
}

async function sendQuickReplyDM(
  token: string,
  recipientId: string,
  text: string,
  quickReplies: { content_type: string; title: string; payload: string }[]
) {
  return InstagramAPI.sendQuickReplyDM(recipientId, text, quickReplies, token);
}

/**
 * Send a DM with clickable buttons using Instagram's Generic Template.
 */
async function sendButtonTemplateDM(
  token: string,
  recipientId: string,
  text: string,
  buttons: { type: 'web_url' | 'postback'; title: string; url?: string; payload?: string }[]
) {
  return InstagramAPI.sendButtonTemplateDM(recipientId, text, buttons, token);
}

/**
 * Send follow-up clickable buttons after content delivery.
 * Strategy: Try Generic Template with web_url buttons.
 * If that fails, send each link as a separate text DM (Instagram auto-renders URLs as tappable).
 * Wrapped in try-catch — if everything fails, text content was already delivered.
 */
async function sendFollowUpButtons(
  token: string,
  recipientId: string,
  automation: any,
  user: any
) {
  try {
    const links: string[] = [];
    if (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) {
      links.push(...automation.dm_links);
    } else if (automation.dm_link) {
      links.push(automation.dm_link);
    }

    const buttons: { type: 'web_url' | 'postback'; title: string; url?: string; payload?: string }[] = [];

    // Add link buttons (max 2 to leave room for profile)
    if (links.length > 0) {
      const linkButtons = links.slice(0, 2).map((l: string, i: number) => {
        let url = l.trim();
        if (!url.match(/^https?:\/\//i)) url = 'https://' + url;
        return {
          type: 'web_url' as const,
          title: links.length > 1 ? `🔗 Link ${i + 1}` : '🔗 Open Link',
          url,
        };
      });
      buttons.push(...linkButtons);
    }

    // Add Visit Profile button
    if (user.instagramHandle) {
      buttons.push({
        type: 'web_url' as const,
        title: '👤 Visit Profile',
        url: `https://instagram.com/${user.instagramHandle}`,
      });
    }

    if (buttons.length === 0) return;

    // Attempt 1: Generic Template with buttons
    const templateTitle = automation.dm_message
      ? (automation.dm_message.length > 80 ? automation.dm_message.substring(0, 77) + '...' : automation.dm_message)
      : 'Thanks for reaching out! 🙌';
    const btnResult = await sendButtonTemplateDM(token, recipientId, templateTitle, buttons.slice(0, 3));
    
    console.log(`[Worker DM] Button template response:`, JSON.stringify(btnResult));

    if (!btnResult.error) {
      console.log(`[Worker DM] ✅ Buttons sent successfully via Generic Template`);
      return; // Success!
    }

    // Attempt 2: Fallback — send profile link as a separate tappable message
    console.warn(`[Worker DM] Generic Template failed:`, JSON.stringify(btnResult.error), `— falling back to text links`);
    
    if (user.instagramHandle) {
      await sendTextDM(token, recipientId, `👤 Visit my profile: https://instagram.com/${user.instagramHandle}`);
    }
  } catch (btnErr) {
    console.error(`[Worker DM] Follow-up buttons completely failed:`, btnErr);
  }
}

// =============================================
// PLAN-BASED RATE LIMITING
// =============================================
async function checkRateLimit(userId: string, planTier: string): Promise<{ allowed: boolean; reason?: string }> {
  const normalizedPlan = (planTier || '').toLowerCase();
  if (normalizedPlan === 'pro' || normalizedPlan === 'elite') {
    return { allowed: true };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('event_type', ['dm_delivered', 'dm_dispatched'])
    .gte('created_at', monthStart.toISOString());

  if ((count || 0) >= 100) {
    return { allowed: false, reason: 'Free plan limit reached (100 DMs/month). Upgrade to Pro for unlimited.' };
  }

  return { allowed: true };
}

// =============================================
// UPSERT CONVERSATION STATE
// =============================================
async function upsertConversation(
  userId: string,
  automationId: string,
  recipientId: string,
  state: string,
  updates: Record<string, string | number | string[] | Record<string, string>> = {}
) {
  // Try update first
  const { data: existing } = await supabase
    .from('dm_conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('automation_id', automationId)
    .eq('recipient_ig_id', recipientId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('dm_conversations')
      .update({ state, updated_at: new Date().toISOString(), ...updates })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('dm_conversations')
      .insert({
        user_id: userId,
        automation_id: automationId,
        recipient_ig_id: recipientId,
        state,
        ...updates,
      });
  }
}

// =============================================
// HELPER: Small delay to let Instagram process the Private Reply
// =============================================
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// 1. DM WORKER (STATE MACHINE)
// =============================================
// TODO: Once Render worker is deployed and confirmed running, wrap this in `if (!process.env.VERCEL)`
// to stop booting workers inside Vercel serverless containers.
export const dmWorker = !process.env.VERCEL ? new Worker('autodrop-queue', async (job: Job<AutomationJob>) => {
  console.log(`[Worker] Processing DM Job: ${job.name} | ${job.id}`);
  const { userId, recipientId, automationId, commentId } = job.data;
  console.log(`[Worker DM] Data: userId=${userId}, recipientId=${recipientId}, automationId=${automationId}, commentId=${commentId}`);

  // Fetch user + automation
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('instagramAccessToken, instagramUserId, plan, instagramHandle, knowledgeBase')
    .eq('id', userId)
    .single();

  console.log(`[Worker DM] User lookup: found=${!!user}, hasToken=${!!user?.instagramAccessToken}, error=${userError?.message || 'none'}`);

  const { data: automation, error: autoError } = await supabase
    .from('automations')
    .select('*')
    .eq('id', automationId)
    .single();

  console.log(`[Worker DM] Automation lookup: found=${!!automation}, error=${autoError?.message || 'none'}`);

  if (!user || !automation) {
    console.error(`[Worker DM] ABORT: user=${!!user}, automation=${!!automation}`);
    throw new Error('Missing Auth or Automation Rules');
  }

  // Handle multi-account credentials switching
  if (automation.instagram_user_id && automation.instagram_user_id !== user.instagramUserId) {
    const { data: conn } = await supabase
      .from('connected_accounts')
      .select('instagram_access_token, instagram_handle, instagram_user_id')
      .eq('user_id', userId)
      .eq('instagram_user_id', automation.instagram_user_id)
      .maybeSingle();

    if (conn) {
      user.instagramAccessToken = conn.instagram_access_token;
      user.instagramHandle = conn.instagram_handle;
      user.instagramUserId = conn.instagram_user_id;
      console.log(`[Worker DM] Switched to connected account: @${conn.instagram_handle} (${conn.instagram_user_id})`);
    } else {
      console.warn(`[Worker DM] Connected account ${automation.instagram_user_id} not found, using primary`);
    }
  }

  if (!user.instagramAccessToken) {
    console.error(`[Worker DM] ABORT: missing access token`);
    throw new Error('Missing Instagram Access Token');
  }

  const token = user.instagramAccessToken;

  const isChainedFromComment = !!job.data.skipDedup || !!job.data.commentId;

  // RATE LIMIT (Plan-based monthly cap)
  if (!isChainedFromComment) {
    const rateCheck = await checkRateLimit(userId, user.plan);
    if (!rateCheck.allowed) {
      console.log(`[Worker] Rate limited user ${userId}: ${rateCheck.reason}`);
      await supabase.from('analytics_events').insert({
        user_id: userId, event_type: 'rate_limited',
        metadata: { reason: rateCheck.reason, automation_id: automationId }
      });
      return { success: false, reason: rateCheck.reason };
    }
  }

  // ANTI-BAN: Hourly DM rate cap (Meta limit: 200/hr, we cap at 150)
  if (!isChainedFromComment) {
    const hourlyCheck = await checkHourlyDMLimit(userId);
    if (!hourlyCheck.allowed) {
      console.warn(`[Worker] ⚠️ Hourly DM cap reached for ${userId}: ${hourlyCheck.count}/${hourlyCheck.limit}`);
      await supabase.from('analytics_events').insert({
        user_id: userId, event_type: 'hourly_dm_cap_hit',
        metadata: { count: hourlyCheck.count, limit: hourlyCheck.limit, automation_id: automationId }
      });
      return { success: false, reason: `Hourly DM cap reached (${hourlyCheck.count}/${hourlyCheck.limit})` };
    }
  }

  // 24h per-user rate limiter has been disabled per user request. Proceeding straight to job dispatching.

  // ---- JOB TYPE: SEND (Initial trigger from comment match) ----
  if (job.name === 'send') {
    const commentId = job.data.commentId;
    const initialText = spinDMGreeting(automation.initial_dm_text);
    const dmText = initialText;

    const isPro = user.plan === 'PRO' || user.plan === 'ELITE';
    const usesComplexFlow = isPro && (automation.follow_gate_enabled || (Array.isArray(automation.lead_capture_fields) && automation.lead_capture_fields.length > 0));

    let result;

    if (commentId) {
      // ===== PRIVATE REPLY PATH =====
      // Instagram only allows ONE text message via Private Reply (comment_id recipient).
      // The 24-hour IGSID messaging window does NOT open until the user replies.
      // ALL automations now require user interaction (Reply YES) before delivering content.
      const finalText = `${dmText}\n\n👇 Reply "YES" to get the link/message!`;

      result = await sendPrivateReply(token, commentId, finalText);
      console.log(`[Worker DM] Private Reply result:`, JSON.stringify(result));

      if (result.error) {
        console.error(`[Worker DM] Private Reply FAILED:`, result.error.message || JSON.stringify(result.error));
        await supabase.from('analytics_events').insert({
          user_id: userId,
          event_type: 'dm_failed',
          metadata: { error: result.error.message || JSON.stringify(result.error), recipient_id: recipientId, comment_id: commentId, automation_id: automationId }
        });
        if (isChainedFromComment) {
          throw new Error(`Necessary DM Private Reply failed: ${result.error.message || JSON.stringify(result.error)}`);
        }
        return { success: false, reason: result.error.message || 'Private Reply failed' };
      }
      
      // Await user's reply for comment triggers
      const igUsername = job.data.commenterUsername || '';
      await upsertConversation(userId, automationId, recipientId, 'awaiting_link_tap', {
        collected_data: { ig_username: igUsername }
      });

    } else {
      // ===== DIRECT DM PATH (no comment_id — e.g., Story triggers or DM triggers) =====
      // The 24-hour window is already open because they DMed us first!
      if (!usesComplexFlow) {
        console.log(`[Worker DM] Direct trigger with no complex flow. Delivering content instantly.`);
        // Instantly deliver the final message and links
        const hasLinks = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
        const links: string[] = hasLinks
          ? (Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link])
          : [];

        if (automation.dm_message) {
          await sendTextDM(token, recipientId, automation.dm_message);
        } else if (links.length === 0) {
          await sendTextDM(token, recipientId, `🚀 Thank you for connecting!`);
        }

        if (links.length > 0) {
          await sendFollowUpButtons(token, recipientId, automation, user);
        }

        await upsertConversation(userId, automationId, recipientId, 'completed');
        await supabase.from('analytics_events').insert({
          user_id: userId,
          event_type: 'dm_delivered',
          metadata: { type: 'instant_dm', recipient_id: recipientId, automation_id: automationId }
        });
        return { success: true, stage: 'instant_delivery' };

      } else {
        // Complex flow (Lead Capture / Follow Gate)
        // Just trigger the button-response flow directly since the window is open
        // This avoids forcing the user to tap "Send me the link" first
        console.log(`[Worker DM] Direct trigger with complex flow. Jumping to button-response (follow gate / lead capture).`);
        await dmQueue.add('button-response', {
          userId,
          automationId,
          recipientId,
          quickReplyPayload: 'GET_LINK', // Mock the payload to jump straight into the flow
        });
        return { success: true, stage: 'bypassed_to_complex_flow' };
      }
    }

    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'dm_delivered',
      metadata: { type: commentId ? 'private_reply' : 'direct_dm', message_id: result?.message_id, recipient_id: recipientId, automation_id: automationId }
    });

    return { success: true, metaId: result?.message_id };
  }

  // ---- JOB TYPE: BUTTON-RESPONSE (User replied YES → deliver content or show follow gate) ----
  if (job.name === 'button-response') {
    const isPro = user.plan === 'PRO' || user.plan === 'ELITE';

    // FOLLOW-GATE (Pro/Elite) — send card with Visit Profile + I'm Following buttons
    if (isPro && automation.follow_gate_enabled) {
      const profileUrl = `https://instagram.com/${user.instagramHandle || ''}`;

      // Try Generic Template first (gives real clickable buttons)
      const followCardResult = await sendButtonTemplateDM(token, recipientId,
        `👀 Follow me first to get the link!`,
        [
          { type: 'web_url', title: '👤 Visit Profile', url: profileUrl },
          { type: 'postback', title: "✅ I'm Following", payload: 'FOLLOWING' },
        ]
      );
      console.log(`[Worker] Follow gate card result:`, JSON.stringify(followCardResult));

      // Fallback to Quick Reply if Generic Template fails
      if (followCardResult.error) {
        console.warn(`[Worker] Generic Template failed for follow gate, using Quick Reply fallback`);
        const qrResult = await sendQuickReplyDM(token, recipientId,
          `👀 Follow me first!\nVisit my profile: ${profileUrl}\nThen tap the button below 👇`,
          [{ content_type: 'text', title: "✅ I'm Following", payload: 'FOLLOWING' }]
        );
        if (qrResult.error) {
          await sendTextDM(token, recipientId,
            `👀 Follow me first!\nVisit: ${profileUrl}\nThen reply "following" to continue!`
          );
        }
      }

      await upsertConversation(userId, automationId, recipientId, 'awaiting_follow');
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'follow_gate_sent',
        metadata: { recipient_id: recipientId, automation_id: automationId }
      });
      return { success: true, stage: 'follow_gate_sent' };
    }


    // LEAD CAPTURE (Pro/Elite)
    const captureFields: string[] = Array.isArray(automation.lead_capture_fields)
      ? automation.lead_capture_fields
      : [];

    if (isPro && captureFields.length > 0) {
      // Ask for the first field
      const firstField = captureFields[0];
      const promptMsg = getLeadPromptMessage(firstField, automation.lead_capture_ask);

      await sendTextDM(token, recipientId, promptMsg);

      await upsertConversation(userId, automationId, recipientId, 'awaiting_lead', {
        current_field_index: 0,
        collected_data: {},
      });

      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'lead_capture_started',
        metadata: { field: firstField, recipient_id: recipientId, automation_id: automationId }
      });
      return { success: true, stage: 'lead_capture_started' };
    }

    // STANDARD DELIVERY — Send message then one card per link
    const hasLinksS = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
    const hasMessageS = !!automation.dm_message;
    const links: string[] = hasLinksS
      ? (Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link])
      : [];

    // Send text message first if present
    if (hasMessageS) {
      await sendTextDM(token, recipientId, automation.dm_message);
    }

    if (links.length > 0) {
      // Send one Generic Template card per link (up to 10)
      for (let i = 0; i < Math.min(links.length, 10); i++) {
        const rawLink = links[i];
        const customName = rawLink.includes('|||') ? rawLink.split('|||')[0] : null;

        // Route through branded redirect page instead of direct URL
        const redirectUrl = getRedirectUrl(automation.id, links.length > 1 ? i : undefined);
        
        const buttonText = customName ? customName : '🔗 Open Link';
        const cardTitle = links.length > 1 ? `🔗 Link ${i + 1}` : '🎁 Here\'s your link!';
        
        const cardResult = await sendButtonTemplateDM(token, recipientId, cardTitle, [
          { type: 'web_url', title: buttonText, url: redirectUrl }
        ]);
        console.log(`[Worker] Link card ${i + 1} result:`, JSON.stringify(cardResult));
        // Fallback to text if card fails
        if (cardResult.error) {
          console.warn(`[Worker] Link card failed, sending text:`, cardResult.error);
          await sendTextDM(token, recipientId, redirectUrl);
        }
      }
    } else if (!hasMessageS) {
      await sendTextDM(token, recipientId, `🚀 Thank you for connecting!`);
    }

    await upsertConversation(userId, automationId, recipientId, 'completed');
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'dm_delivered',
      metadata: { type: 'link_delivered', recipient_id: recipientId, automation_id: automationId }
    });
    return { success: true, stage: 'link_delivered' };
  }

  // ---- JOB TYPE: FOLLOW-VERIFY (User tapped "I'm Following") ----
  if (job.name === 'follow-verify') {
    // Use the Instagram Messaging API to accurately verify follower status via IGSID
    let isFollowing = true; // Default fallback to honor-system in case of Meta API limits
    try {
      const isUserFollows = await InstagramAPI.isUserFollowingBusiness(recipientId, token);
      const followData = { error: null, is_user_follow_business: isUserFollows };
      
      if (!followData.error && typeof followData.is_user_follow_business === 'boolean') {
        isFollowing = followData.is_user_follow_business;
        console.log(`[Worker DM] Follow Verify for ${recipientId}: actually following = ${isFollowing}`);
      } else {
        console.warn(`[Worker DM] Follow Verify API Error:`, followData);
      }
    } catch (err) {
      console.error(`[Worker DM] Follow Verify Fetch Error:`, err);
    }

    if (isFollowing) {
      const hasLinksF = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
      const hasMessageF = !!automation.dm_message;
      const linksF: string[] = hasLinksF
        ? (Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link])
        : [];

      // Send message text first if present
      if (hasMessageF) {
        await sendTextDM(token, recipientId, `✅ Thanks for following!\n\n${automation.dm_message}`);
      } else if (linksF.length === 0) {
        await sendTextDM(token, recipientId, `✅ Thanks for following!`);
      }

      // Send one card per link — routed through branded redirect page
      for (let i = 0; i < Math.min(linksF.length, 10); i++) {
        const rawLink = linksF[i];
        const customName = rawLink.includes('|||') ? rawLink.split('|||')[0] : null;

        const redirectUrl = getRedirectUrl(automation.id, linksF.length > 1 ? i : undefined);
        
        const buttonText = customName ? customName : '🔗 Open Link';
        const cardTitle = linksF.length > 1 ? `🔗 Link ${i + 1}` : `🎁 Here's your link!`;
        
        const cardResult = await sendButtonTemplateDM(token, recipientId, cardTitle, [
          { type: 'web_url', title: buttonText, url: redirectUrl }
        ]);
        console.log(`[Worker] Follow-gate link card ${i + 1}:`, JSON.stringify(cardResult));
        if (cardResult.error) {
          await sendTextDM(token, recipientId, redirectUrl);
        }
      }

      await upsertConversation(userId, automationId, recipientId, 'completed');
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'dm_delivered',
        metadata: { type: 'link_after_follow', recipient_id: recipientId, automation_id: automationId }
      });
    } else {
      // Not following — resend the follow gate card (loops until they follow)
      const profileUrl = `https://instagram.com/${user.instagramHandle || ''}`;
      const retryCard = await sendButtonTemplateDM(token, recipientId,
        `❌ You haven't followed yet! Follow me first to get the link 👇`,
        [
          { type: 'web_url', title: '👤 Visit Profile', url: profileUrl },
          { type: 'postback', title: "✅ I'm Following", payload: 'FOLLOWING' },
        ]
      );
      if (retryCard.error) {
        // Fallback to quick reply
        const qr = await sendQuickReplyDM(token, recipientId,
          `❌ Not following yet!\nVisit: ${profileUrl}\nFollow and tap below 👇`,
          [{ content_type: 'text', title: "✅ I'm Following", payload: 'FOLLOWING' }]
        );
        if (qr.error) {
          await sendTextDM(token, recipientId,
            `❌ You haven't followed yet. Visit ${profileUrl} → Follow → reply "following"`
          );
        }
      }
    }
    return { success: true };
  }

  // ---- JOB TYPE: LEAD-REPLY (User replied with lead data) ----
  if (job.name === 'lead-reply') {
    const { messageText } = job.data;
    if (!messageText) throw new Error('No message text for lead reply');

    // Get conversation state
    const { data: convo } = await supabase
      .from('dm_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('automation_id', automationId)
      .eq('recipient_ig_id', recipientId)
      .maybeSingle();

    if (!convo) throw new Error('No conversation found');

    const captureFields: string[] = Array.isArray(automation.lead_capture_fields)
      ? automation.lead_capture_fields
      : [];
    const currentIndex = convo.current_field_index || 0;
    const currentField = captureFields[currentIndex];

    if (!currentField) {
      // All fields collected already — send content
      const hasLinksLC = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
      if (automation.dm_message && hasLinksLC) {
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
        const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
        await sendTextDM(token, recipientId, `${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`);
      } else if (automation.dm_message) {
        await sendTextDM(token, recipientId, automation.dm_message);
      } else if (hasLinksLC) {
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
        const redirectUrl = getRedirectUrl(automation.id);
        await sendTextDM(token, recipientId, links.length === 1 ? `🚀 Here's your link:\n${redirectUrl}` : `🚀 Here are your links:\n${links.map((l: string, i: number) => `${i+1}. ${l}`).join('\n')}`);
      } else {
        await sendTextDM(token, recipientId, `🚀 Thank you for connecting!`);
      }
      // Send clickable buttons (Open Link, Visit Profile)
      await sendFollowUpButtons(token, recipientId, automation, user);
      await upsertConversation(userId, automationId, recipientId, 'completed');
      return { success: true, stage: 'completed' };
    }

    // Validate
    const validation = validateLeadField(currentField, messageText);

    if (!validation.valid) {
      // Send error + re-prompt
      await sendTextDM(token, recipientId, validation.message || 'That doesn\'t look right. Please try again.');
      return { success: true, stage: 're-prompted' };
    }

    // Save this field
    const updatedLeadData = { ...(convo.collected_data || {}), [currentField]: messageText.trim() };
    const nextIndex = currentIndex + 1;

    // Check if there are more fields to collect
    if (nextIndex < captureFields.length) {
      const nextField = captureFields[nextIndex];
      const promptMsg = getLeadPromptMessage(nextField);
      await sendTextDM(token, recipientId, promptMsg);

      await upsertConversation(userId, automationId, recipientId, 'awaiting_lead', {
        current_field_index: nextIndex,
        collected_data: updatedLeadData,
      });
      return { success: true, stage: `collecting_${nextField}` };
    }

    // All fields collected! Save lead and send link
    const actualUsername = (convo.collected_data as {ig_username?: string})?.ig_username || recipientId;
    await supabase.from('leads').insert({
      user_id: userId,
      automation_id: automationId,
      instagram_username: actualUsername,
      lead_type: captureFields[0], // Primary field type
      lead_value: JSON.stringify(updatedLeadData),
      captured_at: new Date().toISOString(),
    });

    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'lead_captured',
      metadata: { lead_data: updatedLeadData, recipient_id: recipientId, automation_id: automationId }
    });

    const hasLinksEnd = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
    if (automation.dm_message && hasLinksEnd) {
      const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
      const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
      await sendTextDM(token, recipientId, `🎉 ${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`);
    } else if (automation.dm_message) {
      await sendTextDM(token, recipientId, `🎉 ${automation.dm_message}`);
    } else if (hasLinksEnd) {
      const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
      const redirectUrl = getRedirectUrl(automation.id);
      await sendTextDM(token, recipientId, links.length === 1 ? `🎉 Thank you! Here's your link ⬇\n${redirectUrl}` : `🎉 Thank you! Here are your links ⬇\n${links.map((l: string, i: number) => `${i+1}. ${l}`).join('\n')}`);
    } else {
      await sendTextDM(token, recipientId, `🎉 Thank you! We have received your info.`);
    }

    // Send clickable buttons (Open Link, Visit Profile)
    await sendFollowUpButtons(token, recipientId, automation, user);

    await upsertConversation(userId, automationId, recipientId, 'completed', { collected_data: updatedLeadData });

    return { success: true, stage: 'lead_complete_link_sent' };
  }

  // ---- JOB TYPE: AI-REPLY (Elite AI conversation) ----
  if (job.name === 'ai-reply') {
    const ai = new OpenAIProvider();
    const generatedReply = await ai.generateReply(job.data.messageText || '', {
      instagramHandle: user.instagramHandle || 'Autodrop User',
      knowledgeBase: user.knowledgeBase || '',
    }, automation.ai_prompt);

    const aiLinks = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : (automation.dm_link ? [automation.dm_link] : []);
    const aiFallback = automation.dm_message || (aiLinks.length > 0 ? `A team member will assist you shortly! Here are your links:\n${aiLinks.join('\n')}` : 'A team member will assist you shortly!');
    const finalText = generatedReply || aiFallback;
    await sendTextDM(token, recipientId, finalText);

    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'ai_reply_sent',
      metadata: { recipient_id: recipientId, automation_id: automationId }
    });

    return { success: true, stage: 'ai_reply_sent' };
  }

  throw new Error(`Unknown job type: ${job.name}`);

}, {
  connection: createRedisConnection(),
  stalledInterval: 300000,  // Check for stalled jobs every 5 min instead of 30s (saves ~5,500 cmds/day)
  drainDelay: 15,           // Fallback poll every 15s instead of 5s (saves ~15,000 cmds/day)
  concurrency: 5,           // Process up to 5 DM jobs in parallel for speed during spikes
}) : null as any;


// =============================================
// 2. COMMENT REPLY WORKER (Anti-Ban Shield)
// =============================================
// TODO: Once Render worker is deployed and confirmed running, wrap this in `if (!process.env.VERCEL)`
export const commentWorker = !process.env.VERCEL ? new Worker('comment-reply', async (job: Job<AutomationJob>) => {
  console.log(`[Worker] Processing Comment Reply: ${job.id}`);
  const { userId, commentId, automationId, recipientId, commenterUsername } = job.data;

  const { data: user } = await supabase
    .from('users')
    .select('instagramAccessToken, instagramUserId, plan')
    .eq('id', userId)
    .single();

  const { data: automation } = await supabase
    .from('automations')
    .select('instagram_user_id, reply_template, dm_link, dm_message, dm_links, initial_dm_text, follow_gate_enabled, ai_enabled, ai_prompt, lead_capture_type, lead_capture_ask, lead_capture_fields')
    .eq('id', automationId)
    .single();

  if (!user || !automation || !commentId) throw new Error('Missing Data');

  // Handle multi-account credentials switching
  if (automation.instagram_user_id && automation.instagram_user_id !== user.instagramUserId) {
    const { data: conn } = await supabase
      .from('connected_accounts')
      .select('instagram_access_token, instagram_user_id')
      .eq('user_id', userId)
      .eq('instagram_user_id', automation.instagram_user_id)
      .maybeSingle();

    if (conn) {
      user.instagramAccessToken = conn.instagram_access_token;
      user.instagramUserId = conn.instagram_user_id;
      console.log(`[Worker Comment] Switched to connected account token for ${automation.instagram_user_id}`);
    } else {
      console.warn(`[Worker Comment] Connected account ${automation.instagram_user_id} not found, using primary`);
    }
  }

  if (!user.instagramAccessToken) throw new Error('Missing Instagram Access Token');

  // ANTI-BAN: Hourly comment reply rate cap (Meta limit: 750/hr, we cap at 600)
  const hourlyCommentCheck = await checkHourlyCommentLimit(userId);
  if (!hourlyCommentCheck.allowed) {
    console.warn(`[Worker Comment] ⚠️ Hourly comment cap reached for ${userId}: ${hourlyCommentCheck.count}/${hourlyCommentCheck.limit}`);
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'hourly_comment_cap_hit',
      metadata: { count: hourlyCommentCheck.count, limit: hourlyCommentCheck.limit }
    });
    return { success: false, reason: `Hourly comment cap reached (${hourlyCommentCheck.count}/${hourlyCommentCheck.limit})` };
  }

  const rateCheck = await checkRateLimit(userId, user.plan);
  if (!rateCheck.allowed) {
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'rate_limited',
      metadata: { reason: rateCheck.reason }
    });
    return { success: false, reason: rateCheck.reason };
  }

  // ANTI-BAN: 24-hour DM block check BEFORE posting comment reply.
  if (recipientId) {
    const dmAlreadySent = await isDMSentToUser(userId, recipientId);
    if (dmAlreadySent) {
      // User is currently blocked from receiving DMs. Re-queue this comment reply for later.
      const ttl = await getDMRestrictionTTL(userId, recipientId);
      if (ttl > 0) {
        console.log(`[Worker Comment] ⏳ User blocked for ${ttl}s. Re-queueing comment reply for ${recipientId}.`);
        await commentQueue.add(job.name, job.data, { delay: ttl * 1000 + getRandomDelay(5000, 25000) });
        return { success: false, reason: `re-queued for ${ttl}s due to 24h DM limit` };
      }
    }
  }

  // ANTI-BAN: Use reply spinner instead of identical text
  const replyText = spinCommentReply(automation.reply_template);

  const raw = await InstagramAPI.replyToComment(commentId, replyText, user.instagramAccessToken);
  if (raw.error) {
    console.error(`[Worker Comment] FAILED: ${raw.error.message}`);
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'comment_reply_failed',
      metadata: { error: raw.error.message, comment_id: commentId, commenter_username: commenterUsername }
    });
    // Release the lock so they aren't blocked from future tries due to API failure
    if (recipientId) await redis.del(`dm_sent:${userId}:${recipientId}`);
    
    // Comment reply failed — DO NOT dispatch DM (Violation 7 fix)
    throw new Error(raw.error.message);
  }

  await supabase.from('analytics_events').insert({
    user_id: userId, event_type: 'comment_replied',
    metadata: { reply_id: raw.id, comment_id: commentId, commenter_username: commenterUsername }
  });

  // ANTI-BAN: Chain DM job ONLY after comment reply succeeds (Violation 7 fix)
  // DM is dispatched with a random delay (10-60s) for natural timing
  if (recipientId) {
    try {
      await dmQueue.add('send', {
        userId,
        automationId,
        recipientId,
        commenterUsername: commenterUsername || '',
        commentId,
        skipDedup: true, // Bypass check because commentWorker already claimed the lock!
      }, { 
        delay: getRandomDelay(5000, 30000),
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        }
      });
      console.log(`[Worker Comment] ✅ Comment replied → DM job chained with delay for ${recipientId}`);

      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'dm_dispatched',
        metadata: { automation_id: automationId, recipient_id: recipientId, commenter_username: commenterUsername, source: 'comment_chain' }
      });
    } catch (e) {
      console.error(`[Worker Comment] Failed to chain DM job:`, e);
    }
  }

  return { success: true, replyId: raw.id };
}, {
  connection: createRedisConnection(),
  stalledInterval: 300000,  // Check for stalled jobs every 5 min instead of 30s
  drainDelay: 15,           // Fallback poll every 15s instead of 5s
  concurrency: 5,           // Process up to 5 comment jobs in parallel for speed during spikes
}) : null as any;

// Error Logging
if (dmWorker) {
  dmWorker.on('failed', (job, err) => console.error(`[Worker DM] Failed: ${err.message}`));
}
if (commentWorker) {
  commentWorker.on('failed', (job, err) => console.error(`[Worker Comment] Failed: ${err.message}`));
}
