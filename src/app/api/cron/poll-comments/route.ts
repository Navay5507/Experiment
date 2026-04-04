import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { commentQueue, dmQueue } from '@/lib/queue/queues';

/**
 * GET /api/cron/poll-comments
 * 
 * Polls Instagram API for new comments on posts with active automations.
 * This is the RELIABLE fallback for when Meta webhooks don't fire 
 * (common in Dev mode, or during Meta outages).
 * 
 * Can be triggered by:
 *   - A setInterval in the browser dashboard
 *   - A cron job (e.g., Vercel cron)
 *   - Manual GET request
 */
export const dynamic = 'force-dynamic';

// In-memory set of already-processed comment IDs (resets on server restart)
const processedComments = new Set<string>();

export async function GET() {
  console.log('[Poll] 🔄 Starting comment poll cycle...');

  try {
    // 1. Get all active automations with their user data
    const { data: automations, error: autoErr } = await supabase
      .from('automations')
      .select('id, user_id, keywords, instagram_media_id, reply_template, dm_link, initial_dm_text, follow_gate_enabled, ai_enabled, ai_prompt, lead_capture_type, lead_capture_ask, lead_capture_fields')
      .eq('is_active', true);

    if (autoErr || !automations || automations.length === 0) {
      console.log('[Poll] No active automations found.');
      return NextResponse.json({ polled: 0, matched: 0 });
    }

    let totalPolled = 0;
    let totalMatched = 0;

    for (const automation of automations) {
      // 2. Get the user's Instagram access token
      const { data: user } = await supabase
        .from('users')
        .select('id, instagramAccessToken, instagramUserId, plan')
        .eq('id', automation.user_id)
        .maybeSingle();

      if (!user || !user.instagramAccessToken) {
        console.log(`[Poll] ⚠️ No token for user ${automation.user_id}, skipping.`);
        continue;
      }

      const token = user.instagramAccessToken;

      // 3. Get media IDs from this automation
      const mediaIds = automation.instagram_media_id
        ? automation.instagram_media_id.split(',').map((id: string) => id.trim())
        : [];

      if (mediaIds.length === 0) continue;

      // 4. For each media, fetch recent comments
      for (const mediaId of mediaIds) {
        try {
          const commentsRes = await fetch(
            `https://graph.instagram.com/v21.0/${mediaId}/comments` +
            `?fields=id,text,username,timestamp,from` +
            `&limit=25` +
            `&access_token=${token}`
          );
          const commentsData = await commentsRes.json();

          if (commentsData.error) {
            console.log(`[Poll] ⚠️ Error fetching comments for media ${mediaId}:`, commentsData.error.message);
            continue;
          }

          const comments = commentsData.data || [];
          totalPolled += comments.length;

          // 5. Check each comment for keyword matches
          const keywords: string[] = Array.isArray(automation.keywords) ? automation.keywords : [];

          for (const comment of comments) {
            // Skip if already processed
            if (processedComments.has(comment.id)) continue;

            const commentText = (comment.text || '').toLowerCase().trim();
            const matched = keywords.some((kw: string) =>
              commentText.includes(kw.toLowerCase())
            );

            if (!matched) continue;

            // Skip comments from the account owner (don't DM yourself)
            const commenterId = comment.from?.id || comment.username;
            if (commenterId === user.instagramUserId) {
              processedComments.add(comment.id);
              continue;
            }

            // Mark as processed immediately to prevent duplicates
            processedComments.add(comment.id);
            totalMatched++;

            console.log(`[Poll] 🎯 MATCH! Comment "${comment.text}" by @${comment.username} on media ${mediaId}`);

            // 6. Record analytics
            await supabase.from('analytics_events').insert({
              user_id: user.id,
              event_type: 'comment_matched',
              metadata: {
                keyword: keywords.find((kw: string) => commentText.includes(kw.toLowerCase())),
                media_id: mediaId,
                comment_id: comment.id,
                commenter_username: comment.username,
                commenter_id: comment.from?.id,
                source: 'poll',
              },
            });

            // 7. Queue comment reply job
            await commentQueue.add('comment-reply', {
              commentId: comment.id,
              userId: user.id,
              automationId: automation.id,
              replyText: automation.reply_template || 'Check your DM! 👀',
            });
            console.log(`[Poll] ✅ Comment reply job queued for comment ${comment.id}`);

            // 8. Queue DM job (only if we have from.id for DM targeting)
            if (comment.from?.id) {
              await dmQueue.add('send', {
                userId: user.id,
                automationId: automation.id,
                recipientId: comment.from.id,
                commentId: comment.id,
              });
              console.log(`[Poll] ✅ DM send job queued for user ${comment.from.id}`);

              await supabase.from('analytics_events').insert({
                user_id: user.id,
                event_type: 'dm_dispatched',
                metadata: {
                  recipient_id: comment.from.id,
                  automation_id: automation.id,
                  source: 'poll',
                },
              });
            }
          }
        } catch (mediaErr) {
          console.error(`[Poll] Error polling media ${mediaId}:`, mediaErr);
        }
      }
    }

    console.log(`[Poll] ✅ Poll complete. Checked ${totalPolled} comments, matched ${totalMatched}.`);
    return NextResponse.json({ polled: totalPolled, matched: totalMatched });
  } catch (err) {
    console.error('[Poll] Fatal error:', err);
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 });
  }
}
