import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { safeDecrypt } from '@/lib/crypto';
import { commentQueue } from '@/lib/queue/queues';
import { hasCommentBeenProcessed, markCommentProcessed, getRandomDelay, getCommenterDelayMs, getSpacedDelay } from '@/lib/queue/dedup';

export const dynamic = 'force-dynamic';

const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID;

/**
 * POST /api/admin/retrigger-comments
 * 
 * Backfills missed comment automations for a specific user by:
 * 1. Fetching all recent media for their connected IG account via Graph API
 * 2. Fetching all comments on each post
 * 3. Matching each comment against active automations (keyword + media filter)
 * 4. Queuing a commentQueue job for each unprocessed match
 * 
 * Body: { userId: string }  — the AutoDrop internal user UUID
 */
export async function POST(req: Request) {
  // Auth gate — only the app admin can call this
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (ADMIN_CLERK_ID && clerkId !== ADMIN_CLERK_ID) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required in request body' }, { status: 400 });
  }

  // 1. Fetch user + their token
  const { data: user } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .eq('id', userId)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: `No user found with id: ${userId}` }, { status: 404 });
  }

  // 2. Prefer connected_accounts token (freshest)
  let token = safeDecrypt(user.instagramAccessToken);
  let igUserId = user.instagramUserId;

  const { data: conn } = await supabase
    .from('connected_accounts')
    .select('instagram_access_token, instagram_user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (conn) {
    token = safeDecrypt(conn.instagram_access_token) || token;
    igUserId = conn.instagram_user_id || igUserId;
  }

  if (!token || !igUserId) {
    return NextResponse.json({ error: 'No valid Instagram token found for this user' }, { status: 400 });
  }

  // 3. Fetch active post automations for this user
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('target_type', 'post');

  if (!automations || automations.length === 0) {
    return NextResponse.json({ error: 'No active post automations found for this user' }, { status: 404 });
  }

  // 4. Fetch recent media from Instagram Graph API (up to 50 posts)
  let mediaItems: any[] = [];
  try {
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,timestamp&limit=50&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    if (mediaData.error) throw new Error(mediaData.error.message);
    mediaItems = mediaData.data || [];
  } catch (e: any) {
    // Fallback to /{igUserId}/media
    try {
      const mediaRes2 = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,caption,media_type,timestamp&limit=50&access_token=${token}`
      );
      const mediaData2 = await mediaRes2.json();
      if (mediaData2.error) throw new Error(mediaData2.error.message);
      mediaItems = mediaData2.data || [];
    } catch (e2: any) {
      return NextResponse.json({ error: `Failed to fetch media: ${e2.message}` }, { status: 500 });
    }
  }

  console.log(`[Retrigger] Found ${mediaItems.length} media items for user ${userId}`);

  const results = {
    mediaScan: mediaItems.length,
    commentsFound: 0,
    matched: 0,
    queued: 0,
    queuedImmediate: 0,
    queuedDelayed: 0,
    skipped_dedup: 0,
    errors: [] as string[],
  };

  // 5. For each media post, fetch comments and match against automations
  for (const media of mediaItems) {
    let comments: any[] = [];
    try {
      let commentsUrl = `https://graph.instagram.com/v21.0/${media.id}/comments?fields=id,text,from,timestamp&limit=100&access_token=${token}`;
      while (commentsUrl) {
        const commentsRes = await fetch(commentsUrl);
        const commentsData = await commentsRes.json();
        if (commentsData.error) {
          console.warn(`[Retrigger] Error fetching comments for media ${media.id}: ${commentsData.error.message}`);
          break;
        }
        comments.push(...(commentsData.data || []));
        commentsUrl = commentsData.paging?.next || null;
      }
    } catch (e: any) {
      results.errors.push(`Media ${media.id}: ${e.message}`);
      continue;
    }

    results.commentsFound += comments.length;

    for (const comment of comments) {
      const commentId = comment.id;
      const commentText = comment.text || '';
      const commenterId = comment.from?.id;
      const commenterUsername = comment.from?.username || '';

      if (!commenterId) continue;

      // Check dedup — skip already-processed comments
      if (await hasCommentBeenProcessed(commentId)) {
        results.skipped_dedup++;
        continue;
      }

      // Match against automations
      for (const automation of automations) {
        // Media ID filter check
        const targetMediaIds = automation.instagram_media_id
          ? automation.instagram_media_id.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

        if (targetMediaIds.length > 0 && !targetMediaIds.includes(media.id)) continue;

        // Keyword match check — strip quotes defensively
        const rawKeywords: string[] = Array.isArray(automation.keywords)
          ? automation.keywords
          : JSON.parse(automation.keywords || '[]');
        const keywords = rawKeywords.map((kw: string) => kw.trim().replace(/^["']|["']$/g, ''));

        const matched = keywords.length === 0 || keywords.some(kw =>
          commentText.toLowerCase().includes(kw.toLowerCase())
        );

        results.matched++;

        if (!matched) continue;

        // Claim dedup key and queue
        const claimed = await markCommentProcessed(commentId);
        if (!claimed) {
          results.skipped_dedup++;
          continue;
        }

        try {
          // Apply commenter cooldown rolling queue
          let commenterDelayMs = 0;
          if (commenterId) {
            commenterDelayMs = await getCommenterDelayMs(user.id, commenterId);
          }

          if (commenterDelayMs > 0) {
            results.queuedDelayed++;
          } else {
            results.queuedImmediate++;
          }

          await commentQueue.add('reply', {
            userId: user.id,
            automationId: automation.id,
            commentId,
            recipientId: commenterId,
            commenterUsername,
          }, {
            delay: (await getSpacedDelay(user.id, 'comment', 6000)) + commenterDelayMs,
            attempts: 12,
            backoff: {
              type: 'nextHour',
            }
          });
          results.queued++;
          console.log(`[Retrigger] ✅ Queued comment ${commentId} for automation ${automation.id}`);
        } catch (e: any) {
          // Release dedup key so it can be retried
          results.errors.push(`Comment ${commentId}: ${e.message}`);
        }

        // Only trigger one automation per comment
        break;
      }
    }
  }

  console.log(`[Retrigger] Done for user ${userId}:`, results);
  return NextResponse.json({ success: true, userId, ...results });
}
