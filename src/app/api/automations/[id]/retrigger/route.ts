import { NextResponse, after } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { commentQueue, dmQueue } from '@/lib/queue/queues';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: automationId } = await params;

    // 1. Get User Profile & Token
    const { data: user } = await supabase
      .from('users')
      .select('id, instagramAccessToken, instagramUserId')
      .eq('clerkId', userId)
      .single();

    if (!user || !user.instagramAccessToken) {
      return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });
    }

    // 2. Get Automation Details
    const { data: automation, error: autoErr } = await supabase
      .from('automations')
      .select('*')
      .eq('id', automationId)
      .eq('user_id', user.id)
      .single();

    if (autoErr || !automation) {
      return NextResponse.json({ error: 'Automation not found.' }, { status: 404 });
    }

    const token = user.instagramAccessToken;

    // ---- DM AUTOMATIONS: Scan recent conversations for missed keyword matches ----
    if (automation.target_type === 'dm') {
      const keywords: string[] = Array.isArray(automation.keywords) ? automation.keywords : [];

      // Fetch recent conversations from Instagram
      let conversations: any[] = [];
      try {
        const convRes = await fetch(
          `https://graph.instagram.com/v21.0/me/conversations?platform=instagram&access_token=${token}`
        );
        const convData = await convRes.json();
        if (convData.error) {
          console.error('[Retrigger DM] Conversations API error:', convData.error);
          return NextResponse.json({ error: `Instagram API: ${convData.error.message}` }, { status: 400 });
        }
        conversations = convData.data || [];
      } catch (e: any) {
        console.error('[Retrigger DM] Failed to fetch conversations:', e);
        return NextResponse.json({ error: 'Failed to fetch Instagram conversations' }, { status: 500 });
      }

      if (conversations.length === 0) {
        return NextResponse.json({ success: true, queuedCount: 0, message: 'No recent conversations found' });
      }

      // Check which recipients already got a response from this automation
      const { data: existingDMs } = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('automation_id', automation.id)
        .in('event_type', ['dm_delivered', 'dm_keyword_matched']);

      const alreadyHandled = new Set(
        (existingDMs || []).map((e: any) => e.metadata?.recipient_id || e.metadata?.sender_id).filter(Boolean)
      );

      let queuedCount = 0;

      for (const conv of conversations) {
        try {
          // Fetch recent messages in each conversation
          const msgRes = await fetch(
            `https://graph.instagram.com/v21.0/${conv.id}?fields=messages{message,from,created_time}&access_token=${token}`
          );
          const msgData = await msgRes.json();

          if (msgData.error || !msgData.messages?.data) continue;

          for (const msg of msgData.messages.data) {
            const senderId = msg.from?.id;
            const messageText = (msg.message || '').toLowerCase().trim();

            // Skip messages from the page itself
            if (!senderId || senderId === user.instagramUserId) continue;

            // Skip if already handled
            if (alreadyHandled.has(senderId)) continue;

            // Check keyword match
            const matched = keywords.length === 0 || keywords.some((kw: string) =>
              messageText.includes(kw.toLowerCase().trim())
            );

            if (!matched) continue;

            // MATCH! Queue the automation
            alreadyHandled.add(senderId); // Prevent duplicate queuing within this scan

            await supabase.from('analytics_events').insert({
              user_id: user.id,
              automation_id: automation.id,
              event_type: 'dm_keyword_matched',
              metadata: {
                sender_id: senderId,
                keyword: keywords.length > 0 ? keywords.find(kw => messageText.includes(kw.toLowerCase().trim())) : '*',
                source: 'retrigger_manual',
              },
            });

            await dmQueue.add('send', {
              userId: user.id,
              automationId: automation.id,
              recipientId: senderId,
              commenterUsername: 'dm_user',
              skipDedup: true,
            }, { delay: queuedCount * 3000 + 2000 }); // Stagger by 3s per job

            queuedCount++;
            console.log(`[Retrigger DM] ✅ Queued automation for sender ${senderId} (keyword match)`);
          }
        } catch (e) {
          console.error(`[Retrigger DM] Error processing conversation ${conv.id}:`, e);
        }
      }

      // Keep alive so workers can process
      after(async () => {
        console.log('[Retrigger DM] after() → keeping alive for worker...');
        await new Promise(resolve => setTimeout(resolve, 45000));
        console.log('[Retrigger DM] after() → done.');
      });

      return NextResponse.json({ success: true, queuedCount, type: 'dm' });
    }

    // ---- STORY AUTOMATIONS: Cannot retrigger (no API to scan past story replies) ----
    if (automation.target_type === 'story') {
      return NextResponse.json({ 
        error: 'Story automations cannot be retriggered. To test, reply to your story from a personal account with the trigger keyword.' 
      }, { status: 400 });
    }

    // ---- POST AUTOMATIONS: Scan past comments ----
    const mediaIds = automation.instagram_media_id
      ? automation.instagram_media_id.split(',').map((id: string) => id.trim()).filter(Boolean)
      : [];

    if (mediaIds.length === 0) {
      return NextResponse.json({ 
        error: 'Retrigger is only available for automations with specific posts selected. Go to Edit and select a post.' 
      }, { status: 400 });
    }

    // 3. Load previously processed comments so we don't spam
    const { data: previousEvents } = await supabase
      .from('analytics_events')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('event_type', 'comment_matched');

    const processedIds = new Set(
      previousEvents?.map((e: any) => e.metadata?.comment_id).filter(Boolean) || []
    );

    let queuedCount = 0;

    // 4. Fetch and Process Comments
    const keywords: string[] = Array.isArray(automation.keywords) ? automation.keywords : [];

    for (const mediaId of mediaIds) {
      try {
        const commentsRes = await fetch(
          `https://graph.instagram.com/v21.0/${mediaId}/comments?fields=id,text,username,timestamp,from&limit=50&access_token=${token}`
        );
        const commentsData = await commentsRes.json();

        if (commentsData.error) {
          console.error(`[Retrigger] Error fetching comments for ${mediaId}`, commentsData.error);
          continue;
        }

        const comments = commentsData.data || [];

        for (const comment of comments) {
          if (processedIds.has(comment.id)) continue; // Already processed

          const commentText = (comment.text || '').toLowerCase().trim();
          const matched = keywords.length === 0 || keywords.some((kw: string) => commentText.includes(kw.toLowerCase()));

          if (!matched) continue;

          // Don't DM yourself
          const commenterId = comment.from?.id || comment.username;
          if (commenterId === user.instagramUserId) continue;

          // MATCH!
          processedIds.add(comment.id);

          // Record Analytics
          await supabase.from('analytics_events').insert({
            user_id: user.id,
            event_type: 'comment_matched',
            metadata: {
              keyword: keywords.length > 0 ? keywords.find(kw => commentText.includes(kw.toLowerCase())) : 'any',
              media_id: mediaId,
              comment_id: comment.id,
              commenter_username: comment.username,
              commenter_id: comment.from?.id,
              source: 'retrigger_manual',
            },
          });

          // Queue Reply (if configured)
          if (automation.reply_template) {
            await commentQueue.add('comment-reply', {
              commentId: comment.id,
              userId: user.id,
              automationId: automation.id,
              replyText: automation.reply_template,
            });
          }

          // Queue DM
          if (comment.from?.id) {
            await dmQueue.add('send', {
              userId: user.id,
              automationId: automation.id,
              recipientId: comment.from.id,
              commentId: comment.id,
            });

            await supabase.from('analytics_events').insert({
              user_id: user.id,
              event_type: 'dm_dispatched',
              metadata: {
                recipient_id: comment.from.id,
                automation_id: automation.id,
                source: 'retrigger_manual',
              },
            });

            queuedCount++;
          }
        }
      } catch (e) {
        console.error('[Retrigger] Inner loop error', e);
      }
    }

    return NextResponse.json({ success: true, queuedCount });
  } catch (error: any) {
    console.error('[Retrigger API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
