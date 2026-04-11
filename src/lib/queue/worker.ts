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
 * IMPORTANT (Meta Docs): Private Reply only supports TEXT messages.
 * Button Templates, Generic Templates, and Quick Replies are NOT supported
 * on the Private Reply endpoint (recipient: { comment_id }).
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
            template_type: 'button',
            text,
            buttons,
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
      // Step 1: Send text-only Private Reply (templates NOT supported on comment_id recipient)
      result = await sendPrivateReply(token, commentId, dmText);
      console.log(`[Worker DM] Private Reply result:`, JSON.stringify(result));

      if (result.error) {
        console.error(`[Worker DM] Private Reply FAILED:`, result.error.message || JSON.stringify(result.error));
        await supabase.from('analytics_events').insert({
          user_id: userId, event_type: 'dm_failed',
          metadata: { error: result.error.message || JSON.stringify(result.error), recipient_id: recipientId, comment_id: commentId }
        });
        return { success: false, reason: result.error.message || 'Private Reply failed' };
      }

      // CRITICAL: The Private Reply response returns the correct Instagram-scoped ID (IGSID).
      // The recipientId from the webhook (commenter's IG user ID) is NOT the same as the IGSID
      // required for sending DMs via recipient: { id }. We MUST use the IGSID from the response.
      const igsid = result.recipient_id || recipientId;
      console.log(`[Worker DM] IGSID from Private Reply: ${igsid} (original recipientId: ${recipientId})`);

      // Step 2: Now that the conversation is opened, send a follow-up Button Template via IGSID
      // Wait for Instagram to process the Private Reply and establish the conversation thread
      await delay(2000);

      if (usesComplexFlow) {
        // Pro Flow: Send "Send me the access" button
        console.log(`[Worker DM] Sending follow-up button template to IGSID: ${igsid}`);
        const followUpResult = await sendButtonTemplateDM(token, igsid,
          '👆 Tap below to continue!',
          [{ type: 'postback', title: 'Send me the access', payload: 'GET_LINK' }]
        );
        console.log(`[Worker DM] Follow-up button template result:`, JSON.stringify(followUpResult));
        if (followUpResult.error) {
          console.warn(`[Worker DM] Follow-up button failed (${followUpResult.error.message}), trying quick reply...`);
          const qrResult = await sendQuickReplyDM(token, igsid,
            '👆 Tap below to continue!',
            [{ content_type: 'text', title: 'Send me the access', payload: 'GET_LINK' }]
          );
          console.log(`[Worker DM] Quick reply fallback result:`, JSON.stringify(qrResult));
          if (qrResult.error) {
            console.warn(`[Worker DM] Quick reply also failed, sending as text`);
            await sendTextDM(token, igsid, '👆 Reply "YES" to get the link!');
          }
        }
      } else {
        // Standard Flow: Send URL button directly
        if (automation.dm_link) {
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
          console.log(`[Worker DM] Sending follow-up link button to IGSID: ${igsid}`);
          const followUpResult = await sendButtonTemplateDM(token, igsid,
            '👇 Here\'s your link!',
            [{ type: 'web_url', title: 'Open Link', url: redirectUrl }]
          );
          console.log(`[Worker DM] Follow-up link button result:`, JSON.stringify(followUpResult));
          if (followUpResult.error) {
            console.warn(`[Worker DM] Button template failed (${followUpResult.error.message}), sending as text`);
            // Fallback: send as plain text with URL
            await sendTextDM(token, igsid, `Here's your link 🔗\n${redirectUrl}`);
          }
        }
      }

    } else {
      // ===== DIRECT DM PATH (no comment_id — e.g., Story triggers) =====
      // Can use Button Templates directly since we're sending via IGSID
      if (usesComplexFlow) {
        result = await sendButtonTemplateDM(token, recipientId, dmText,
          [{ type: 'postback', title: 'Send me the access', payload: 'GET_LINK' }]
        );
        if (result.error) {
          console.warn(`[Worker DM] Button template failed, trying quick reply:`, result.error);
          result = await sendQuickReplyDM(token, recipientId, dmText,
            [{ content_type: 'text', title: 'Send me the access', payload: 'GET_LINK' }]
          );
        }
      } else {
        // Standard flow: send URL button template
        if (automation.dm_link) {
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
          result = await sendButtonTemplateDM(token, recipientId, dmText,
            [{ type: 'web_url', title: 'Open Link', url: redirectUrl }]
          );
          if (result.error) {
            console.warn(`[Worker DM] Button template failed, sending as text:`, result.error);
            result = await sendTextDM(token, recipientId, `${dmText}\n\n${redirectUrl}`);
          }
        } else {
          result = await sendTextDM(token, recipientId, dmText);
        }
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
      const followGateResult = await sendButtonTemplateDM(token, recipientId,
        'Oops! Looks like you haven\'t followed me yet 👀\nIt would mean a lot if you could visit my profile and hit that follow button 😁.',
        [
          { type: 'web_url', title: 'Visit Profile', url: `https://instagram.com/${user.instagramHandle || ''}` },
          { type: 'postback', title: '✅ I\'m following', payload: 'FOLLOWING' }
        ]
      );

      // Fallback to Quick Replies if Button Template fails
      if (followGateResult.error) {
        console.warn(`[Worker DM] Follow-gate button failed, using quick replies:`, followGateResult.error);
        await sendQuickReplyDM(token, recipientId,
          `Oops! Looks like you haven't followed me yet 👀\nPlease follow @${user.instagramHandle || 'us'} and tap "I'm Following" below!`,
          [
            { content_type: 'text', title: '✅ I\'m following', payload: 'FOLLOWING' }
          ]
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

    // STANDARD — Send link directly
    if (automation.dm_link) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
      const linkResult = await sendButtonTemplateDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here's the promised link ⬇`, [
        { type: 'web_url', title: 'Click me', url: redirectUrl }
      ]);
      if (linkResult.error) {
        console.warn(`[Worker DM] Link button failed, sending as text:`, linkResult.error);
        await sendTextDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here's the promised link:\n${redirectUrl}`);
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
      if (automation.dm_link) {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
        const linkResult = await sendButtonTemplateDM(token, recipientId, `Hi!\nGlad you commented 🙌 Here's the promised link ⬇`, [
          { type: 'web_url', title: 'Click me', url: redirectUrl }
        ]);
        if (linkResult.error) {
          console.warn(`[Worker DM] Link button failed, sending as text:`, linkResult.error);
          await sendTextDM(token, recipientId, `Thanks for following! Here's your link:\n${redirectUrl}`);
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
      const retryResult = await sendButtonTemplateDM(token, recipientId,
        "❌ It seems like you haven't followed us yet. Please follow our profile and try again!",
        [
          { type: 'web_url', title: 'Visit Profile', url: `https://instagram.com/${user.instagramHandle || ''}` },
          { type: 'postback', title: '✅ I\'m following', payload: 'FOLLOWING' }
        ]
      );
      if (retryResult.error) {
        console.warn(`[Worker DM] Retry button failed, using quick replies:`, retryResult.error);
        await sendQuickReplyDM(token, recipientId,
          `❌ It seems like you haven't followed us yet. Please follow @${user.instagramHandle || 'us'} and try again!`,
          [{ content_type: 'text', title: '✅ I\'m following', payload: 'FOLLOWING' }]
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
      // All fields collected already — send the link
      if (automation.dm_link) {
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
        const linkResult = await sendButtonTemplateDM(token, recipientId, `🚀 Here's your link!`, [
          { type: 'web_url', title: 'Click me', url: redirectUrl }
        ]);
        if (linkResult.error) {
          await sendTextDM(token, recipientId, `🚀 Here's your link: ${redirectUrl}`);
        }
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

    if (automation.dm_link) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${automation.id}`;
      const linkResult = await sendButtonTemplateDM(token, recipientId, `🎉 Thank you! Here's your link ⬇`, [
        { type: 'web_url', title: 'Click me', url: redirectUrl }
      ]);
      if (linkResult.error) {
        await sendTextDM(token, recipientId, `🎉 Thank you! Here's your link: ${redirectUrl}`);
      }
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

    const finalText = generatedReply || `A team member will assist you shortly! Here is the link: ${automation.dm_link}`;
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
    .select('reply_template, dm_link')
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
