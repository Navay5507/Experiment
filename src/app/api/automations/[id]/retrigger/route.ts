import { NextResponse } from 'next/server';
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

    // We can only process specific media IDs for historical comments easily
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
          // Mark as processed safely (so it's not processed twice in the same loop logic)
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
