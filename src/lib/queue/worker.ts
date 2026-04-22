import { Worker, Job } from 'bullmq';
import { redis } from './redis';
import { supabase } from '../supabase';
import { OpenAIProvider } from '../ai/openai';
import { validateLeadField, getLeadPromptMessage } from '../validators';

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
}

// =============================================
// INSTAGRAM MESSAGE HELPERS
// =============================================
async function sendTextDM(token: string, recipientId: string, text: string) {
  const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
  return res.json();
}

/**
 * Send a Private Reply to a commenter. Uses comment_id in recipient.
 * 
 * IMPORTANT (Meta Docs): Private Reply ONLY supports plain TEXT messages.
 * Button Templates, Generic Templates, and Quick Replies are NOT supported
 * on the Private Reply endpoint (recipient: { comment_id }).
 * Any template sent here will corrupt the chat and crash the Instagram app.
 * Templates can only be sent via IGSID (recipient: { id }) after the
 * conversation has been opened by the Private Reply.
 */
async function sendPrivateReply(token: string, commentId: string, text: string) {
  console.log(`[Worker] Sending Private Reply (text-only) to comment ${commentId}`);
  const payload = {
    recipient: { comment_id: commentId },
    message: { text },
  };

  const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function sendQuickReplyDM(
  token: string,
  recipientId: string,
  text: string,
  quickReplies: { content_type: string; title: string; payload: string }[]
) {
  const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: quickReplies,
      },
    }),
  });
  return res.json();
}

/**
 * Send a DM with clickable buttons using Instagram's Generic Template.
 * 
 * IMPORTANT: Instagram does NOT support template_type: 'button' — that is
 * a Facebook Messenger feature. Sending it crashes the Instagram mobile app.
 * Instagram only supports template_type: 'generic' for structured messages.
 */
async function sendButtonTemplateDM(
  token: string,
  recipientId: string,
  text: string,
  buttons: { type: 'web_url' | 'postback'; title: string; url?: string; payload?: string }[]
) {
  const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: text.length > 80 ? text.substring(0, 77) + '...' : text,
                subtitle: text.length > 80 ? text : undefined,
                buttons,
              }
            ],
          }
        }
      }
    }),
  });
  return res.json();
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
export const dmWorker = new Worker('autodrop-queue', async (job: Job<AutomationJob>) => {
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

  if (!user?.instagramAccessToken || !automation) {
    console.error(`[Worker DM] ABORT: user=${!!user}, hasToken=${!!user?.instagramAccessToken}, automation=${!!automation}`);
    throw new Error('Missing Auth or Automation Rules');
  }

  const token = user.instagramAccessToken;

  // RATE LIMIT
  const rateCheck = await checkRateLimit(userId, user.plan);
  if (!rateCheck.allowed) {
    console.log(`[Worker] Rate limited user ${userId}: ${rateCheck.reason}`);
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'rate_limited',
      metadata: { reason: rateCheck.reason, automation_id: automationId }
    });
    return { success: false, reason: rateCheck.reason };
  }

  // ---- JOB TYPE: SEND (Initial trigger from comment match) ----
  if (job.name === 'send') {
    const commentId = job.data.commentId;
    const initialText = automation.initial_dm_text || 'Thanks for your interest! Here is the link 🔗';
    let dmText = initialText;

    const isPro = user.plan === 'PRO' || user.plan === 'ELITE';
    const usesComplexFlow = isPro && (automation.follow_gate_enabled || (Array.isArray(automation.lead_capture_fields) && automation.lead_capture_fields.length > 0));

    let result;

    if (commentId) {
      // ===== PRIVATE REPLY PATH =====
      // Instagram only allows ONE text message via Private Reply (comment_id recipient).
      // The 24-hour IGSID messaging window does NOT open until the user replies.
      // So we MUST include everything (CTA, URL) in this single message.
      let finalText = dmText;

      // Build link content: prefer dm_links array, fall back to dm_link
      const hasLinks = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
      const hasMessage = !!automation.dm_message;

      if (usesComplexFlow) {
        // Pro Flow: ask user to reply to open the 24-hr messaging window
        finalText = `${dmText}\n\n👇 Reply "YES" to get the link!`;
      } else if (hasMessage && hasLinks) {
        // Both message + links
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
          ? automation.dm_links
          : [automation.dm_link];
        const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
        finalText = `${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`;
      } else if (hasMessage) {
        // Message only
        finalText = automation.dm_message;
      } else if (hasLinks) {
        // Links only (backward compatible)
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
          ? automation.dm_links
          : [automation.dm_link];
        if (links.length === 1) {
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
          finalText = `${dmText}\n\n👇 Here's your link:\n${redirectUrl}`;
        } else {
          const linksText = links.map((l: string, i: number) => `${i + 1}. ${l}`).join('\n');
          finalText = `${dmText}\n\n🔗 Links:\n${linksText}`;
        }
      }

      result = await sendPrivateReply(token, commentId, finalText);
      console.log(`[Worker DM] Private Reply result:`, JSON.stringify(result));

      if (result.error) {
        console.error(`[Worker DM] Private Reply FAILED:`, result.error.message || JSON.stringify(result.error));
        await supabase.from('analytics_events').insert({
          user_id: userId, event_type: 'dm_failed',
          metadata: { error: result.error.message || JSON.stringify(result.error), recipient_id: recipientId, comment_id: commentId }
        });
        return { success: false, reason: result.error.message || 'Private Reply failed' };
      }

    } else {
      // ===== DIRECT DM PATH (no comment_id — e.g., Story triggers) =====
      // Story replies open the 24-hour window, so Quick Replies work here.
      if (usesComplexFlow) {
        result = await sendQuickReplyDM(token, recipientId, dmText,
          [{ content_type: 'text', title: 'Send me the access', payload: 'GET_LINK' }]
        );
        if (result.error) {
          console.warn(`[Worker DM] Quick reply failed, sending text fallback:`, result.error);
          result = await sendTextDM(token, recipientId, `${dmText}\n\n👇 Reply "YES" to get the link!`);
        }
      } else {
        // Standard flow: build text from message + links
        const hasLinksD = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
        const hasMessageD = !!automation.dm_message;
        let dmFinalText = dmText;

        if (hasMessageD && hasLinksD) {
          const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
            ? automation.dm_links
            : [automation.dm_link];
          const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
          dmFinalText = `${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`;
        } else if (hasMessageD) {
          dmFinalText = automation.dm_message;
        } else if (hasLinksD) {
          const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
            ? automation.dm_links
            : [automation.dm_link];
          if (links.length === 1) {
            const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
            dmFinalText = `${dmText}\n\n👇 Here's your link:\n${redirectUrl}`;
          } else {
            const linksText = links.map((l: string, i: number) => `${i + 1}. ${l}`).join('\n');
            dmFinalText = `${dmText}\n\n🔗 Links:\n${linksText}`;
          }
        }

        result = await sendTextDM(token, recipientId, dmFinalText);
      }

      console.log(`[Worker DM] Send result:`, JSON.stringify(result));

      if (result.error) {
        console.error(`[Worker DM] FAILED:`, result.error.message || JSON.stringify(result.error));
        await supabase.from('analytics_events').insert({
          user_id: userId, event_type: 'dm_failed',
          metadata: { error: result.error.message || JSON.stringify(result.error), recipient_id: recipientId, comment_id: commentId }
        });
        return { success: false, reason: result.error.message || 'DM send failed' };
      }
    }

    // Determine state tracking based on flow
    if (usesComplexFlow) {
      const igUsername = job.data.commenterUsername || '';
      await upsertConversation(userId, automationId, recipientId, 'awaiting_link_tap', {
        collected_data: { ig_username: igUsername }
      });
    } else {
      await upsertConversation(userId, automationId, recipientId, 'completed');
    }

    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'dm_delivered',
      metadata: { type: commentId ? 'private_reply' : 'direct_dm', message_id: result?.message_id, recipient_id: recipientId, automation_id: automationId }
    });

    return { success: true, metaId: result?.message_id };
  }

  // ---- JOB TYPE: BUTTON-RESPONSE (User tapped "Send me the link") ----
  if (job.name === 'button-response') {
    const isPro = user.plan === 'PRO' || user.plan === 'ELITE';

    // FOLLOW-GATE (Pro/Elite)
    if (isPro && automation.follow_gate_enabled) {
      // Send follow gate with Quick Replies and profile link in text
      const profileUrl = `https://instagram.com/${user.instagramHandle || ''}`;
      const followGateResult = await sendQuickReplyDM(token, recipientId,
        `Oops! Looks like you haven't followed me yet 👀\nVisit my profile: ${profileUrl}\nFollow me and tap \"I'm following\" below! 😁`,
        [
          { content_type: 'text', title: "✅ I'm following", payload: 'FOLLOWING' }
        ]
      );

      if (followGateResult.error) {
        console.error(`[Worker DM] Follow-gate quick reply failed:`, followGateResult.error);
        await sendTextDM(token, recipientId,
          `Oops! Looks like you haven't followed me yet 👀\nFollow @${user.instagramHandle || 'us'} and reply \"following\" to continue!`
        );
      }

      await upsertConversation(userId, automationId, recipientId, 'awaiting_follow');

      await supabase.from('analytics_events').insert({
        user_id: userId, event_type: 'follow_gate_sent',
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
        user_id: userId, event_type: 'lead_capture_started',
        metadata: { field: firstField, recipient_id: recipientId, automation_id: automationId }
      });
      return { success: true, stage: 'lead_capture_started' };
    }

    // STANDARD — Send message and/or links
    const hasLinksS = (Array.isArray(automation.dm_links) && automation.dm_links.length > 0) || automation.dm_link;
    const hasMessageS = !!automation.dm_message;

    if (hasMessageS && hasLinksS) {
      const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
        ? automation.dm_links : [automation.dm_link];
      const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
      await sendTextDM(token, recipientId, `${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`);
    } else if (hasMessageS) {
      await sendTextDM(token, recipientId, automation.dm_message);
    } else if (hasLinksS) {
      const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0
        ? automation.dm_links : [automation.dm_link];
      if (links.length === 1) {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
        await sendTextDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here's the promised link ⬇\n${redirectUrl}`);
      } else {
        const linksText = links.map((l: string, i: number) => `${i + 1}. ${l}`).join('\n');
        await sendTextDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here are your links ⬇\n${linksText}`);
      }
    } else {
      await sendTextDM(token, recipientId, `🚀 Thank you for connecting!`);
    }
    await upsertConversation(userId, automationId, recipientId, 'completed');

    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'dm_delivered',
      metadata: { type: 'link_delivered', recipient_id: recipientId, automation_id: automationId }
    });
    return { success: true, stage: 'link_delivered' };
  }

  // ---- JOB TYPE: FOLLOW-VERIFY (User tapped "I'm Following") ----
  if (job.name === 'follow-verify') {
    // Use the Instagram Messaging API to accurately verify follower status via IGSID
    let isFollowing = true; // Default fallback to honor-system in case of Meta API limits
    try {
      const followCheckRes = await fetch(
        `https://graph.instagram.com/v21.0/${recipientId}?fields=is_user_follow_business&access_token=${token}`
      );
      const followData = await followCheckRes.json();
      
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
      if (hasMessageF && hasLinksF) {
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
        const linksText = links.map((l: string, i: number) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
        await sendTextDM(token, recipientId, `${automation.dm_message}\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`);
      } else if (hasMessageF) {
        await sendTextDM(token, recipientId, automation.dm_message);
      } else if (hasLinksF) {
        const links = Array.isArray(automation.dm_links) && automation.dm_links.length > 0 ? automation.dm_links : [automation.dm_link];
        if (links.length === 1) {
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
          await sendTextDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here's the promised link ⬇\n${redirectUrl}`);
        } else {
          const linksText = links.map((l: string, i: number) => `${i + 1}. ${l}`).join('\n');
          await sendTextDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here are your links ⬇\n${linksText}`);
        }
      } else {
        await sendTextDM(token, recipientId, `✅ Thanks for following!`);
      }
      await upsertConversation(userId, automationId, recipientId, 'completed');

      await supabase.from('analytics_events').insert({
        user_id: userId, event_type: 'dm_delivered',
        metadata: { type: 'link_after_follow', recipient_id: recipientId }
      });
    } else {
      // Not following — send Quick Reply to retry
      const profileUrl = `https://instagram.com/${user.instagramHandle || ''}`;
      const retryResult = await sendQuickReplyDM(token, recipientId,
        `❌ It seems like you haven't followed us yet.\nVisit my profile: ${profileUrl}\nFollow and tap below to try again!`,
        [{ content_type: 'text', title: "✅ I'm following", payload: 'FOLLOWING' }]
      );
      if (retryResult.error) {
        await sendTextDM(token, recipientId,
          `❌ You haven't followed us yet. Follow @${user.instagramHandle || 'us'} and reply "following" to get the link!`
        );
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
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
        await sendTextDM(token, recipientId, links.length === 1 ? `🚀 Here's your link:\n${redirectUrl}` : `🚀 Here are your links:\n${links.map((l: string, i: number) => `${i+1}. ${l}`).join('\n')}`);
      } else {
        await sendTextDM(token, recipientId, `🚀 Thank you for connecting!`);
      }
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
    const actualUsername = (convo.collected_data as any)?.ig_username || recipientId;
    await supabase.from('leads').insert({
      user_id: userId,
      automation_id: automationId,
      instagram_username: actualUsername,
      lead_type: captureFields[0], // Primary field type
      lead_value: JSON.stringify(updatedLeadData),
      captured_at: new Date().toISOString(),
    });

    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'lead_captured',
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
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
      await sendTextDM(token, recipientId, links.length === 1 ? `🎉 Thank you! Here's your link ⬇\n${redirectUrl}` : `🎉 Thank you! Here are your links ⬇\n${links.map((l: string, i: number) => `${i+1}. ${l}`).join('\n')}`);
    } else {
      await sendTextDM(token, recipientId, `🎉 Thank you! We have received your info.`);
    }

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

}, { connection: redis });


// =============================================
// 2. COMMENT REPLY WORKER
// =============================================
export const commentWorker = new Worker('comment-reply', async (job: Job<AutomationJob>) => {
  console.log(`[Worker] Processing Comment Reply: ${job.id}`);
  const { userId, commentId, automationId } = job.data;

  const { data: user } = await supabase
    .from('users')
    .select('instagramAccessToken, plan')
    .eq('id', userId)
    .single();

  const { data: automation } = await supabase
    .from('automations')
    .select('reply_template, dm_link, dm_message, dm_links')
    .eq('id', automationId)
    .single();

  if (!user?.instagramAccessToken || !automation) throw new Error('Missing Data');

  const rateCheck = await checkRateLimit(userId, user.plan);
  if (!rateCheck.allowed) {
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'rate_limited',
      metadata: { reason: rateCheck.reason }
    });
    return { success: false, reason: rateCheck.reason };
  }

  // Use reply template as configured by the user
  const replyText = automation.reply_template || 'Check your DM! 👀';

  const res = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.instagramAccessToken}` },
    body: JSON.stringify({ message: replyText }),
  });

  const raw = await res.json();
  if (raw.error) {
    console.error(`[Worker Comment] FAILED: ${raw.error.message}`);
    await supabase.from('analytics_events').insert({
      user_id: userId, event_type: 'comment_reply_failed',
      metadata: { error: raw.error.message, comment_id: commentId }
    });
    throw new Error(raw.error.message);
  }

  await supabase.from('analytics_events').insert({
    user_id: userId, event_type: 'comment_replied',
    metadata: { reply_id: raw.id, comment_id: commentId }
  });

  return { success: true, replyId: raw.id };
}, { connection: redis });

// Error Logging
dmWorker.on('failed', (job, err) => console.error(`[Worker DM] Failed: ${err.message}`));
commentWorker.on('failed', (job, err) => console.error(`[Worker Comment] Failed: ${err.message}`));
