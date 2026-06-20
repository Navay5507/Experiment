import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { commentQueue, dmQueue } from '@/lib/queue/queues';
import { isCommentProcessed, getRandomDelay, getDMRestrictionTTL } from '@/lib/queue/dedup';
import { safeDecrypt } from '@/lib/crypto';

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

export async function GET(req: Request) {
  // Secure the cron endpoint — only allow Vercel Cron or calls with the service role key
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('[Poll] 🔄 Starting comment poll cycle...');

  try {
    // 1. Get all active automations with their user data using a JOIN to prevent N+1 queries
    const { data: automations, error: autoErr } = await supabase
      .from('automations')
      .select(`
        id, user_id, keywords, instagram_media_id, reply_template, 
        dm_link, dm_message, dm_links, initial_dm_text, follow_gate_enabled, 
        ai_enabled, ai_prompt, lead_capture_type, lead_capture_ask, lead_capture_fields,
        user:users(id, instagramAccessToken, instagramUserId, plan)
      `)
      .eq('is_active', true);

    if (autoErr || !automations || automations.length === 0) {
      console.log('[Poll] No active automations found.');
      return NextResponse.json({ polled: 0, matched: 0 });
    }

    let totalPolled = 0;
    let totalMatched = 0;

    for (const automation of automations) {
      // 2. Extract joined user data
      const user = Array.isArray(automation.user) ? automation.user[0] : automation.user;

      if (!user || !user.instagramAccessToken) {
        console.log(`[Poll] ⚠️ No token for user ${automation.user_id}, skipping.`);
        continue;
      }

      const token = safeDecrypt(user.instagramAccessToken);

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
            // Deduplicate via Redis
            if (await isCommentProcessed(comment.id)) {
                console.log(`[Poll] ⏩ Skipping already processed comment ${comment.id}`);
                continue;
            }

            // Skip comments older than 24 hours — Redis 7-day dedup handles idempotency.
              // 2h cutoff was too aggressive: delayed jobs (up to 25s) would still mark comments
              // as processed in Redis, but if the worker died the comment could never be re-tried
              // since the cron would then reject it as "too old" on the next run.
              if (comment.timestamp) {
                const commentAge = Date.now() - new Date(comment.timestamp).getTime();
                const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
                if (commentAge > TWENTY_FOUR_HOURS_MS) {
                  console.log(`[Poll] ⏩ Skipping comment ${comment.id} because it is older than 24h (${Math.round(commentAge/3600000)}h old). Text: "${comment.text}"`);
                  continue;
                }
              }

            const commentText = (comment.text || '').toLowerCase().trim();
            const matched = keywords.some((kw: string) =>
              commentText.includes(kw.toLowerCase())
            );

            console.log(`[Poll] Comment ${comment.id} text: "${commentText}", keywords: [${keywords}], matched: ${matched}`);

            if (!matched) continue;

            // Skip comments from the account owner (don't DM yourself)
            const commenterId = comment.from?.id || comment.username;
            if (commenterId === user.instagramUserId) {
              continue;
            }

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

            // Get DM restriction TTL
            const dmTTL = comment.from?.id ? await getDMRestrictionTTL(user.id, comment.from.id) : 0;
            const baseDelay = dmTTL > 0 ? dmTTL * 1000 : 0;
            if (dmTTL > 0) {
              console.log(`[Poll] ⏳ DM limit active for ${comment.from?.id}. Delaying comment reply by ${dmTTL}s`);
            }

            // 7. Queue comment reply job
            await commentQueue.add('comment-reply', {
              commentId: comment.id,
              userId: user.id,
              automationId: automation.id,
              recipientId: comment.from?.id,
              commenterUsername: comment.username,
              replyText: automation.reply_template || 'Check your DM! 👀',
            }, { delay: baseDelay + getRandomDelay(5000, 25000) });
            console.log(`[Poll] ✅ Comment reply job queued with delay for comment ${comment.id}`);

            // 8. Queue DM job (only if we have from.id for DM targeting)
            if (comment.from?.id) {
              // DM is now chained from the comment worker after success
              // No standalone DM dispatch here for standard comments
              console.log(`[Poll] ✅ DM will be chained from comment worker for user ${comment.from.id}`);

              await supabase.from('analytics_events').insert({
                user_id: user.id,
                event_type: 'dm_dispatched',
                metadata: {
                  recipient_id: comment.from.id,
                  automation_id: automation.id,
                  source: 'poll_comment_chain',
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
    // Keep process alive so booted workers can consume queued jobs (max delay 25s + processing buffer)
    await new Promise(resolve => setTimeout(resolve, 45000));
    return NextResponse.json({ polled: totalPolled, matched: totalMatched });
  } catch (err) {
    console.error('[Poll] Fatal error:', err);
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 });
  }
}
