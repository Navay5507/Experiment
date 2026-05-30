import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/queue/pending-comments
 * 
 * Returns recent comments that matched an automation keyword but may not 
 * have been replied to yet (no corresponding comment_replied event).
 */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all comment_matched events from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: matched } = await supabase
      .from('analytics_events')
      .select('id, created_at, metadata')
      .eq('user_id', user.id)
      .eq('event_type', 'comment_matched')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (!matched || matched.length === 0) {
      return NextResponse.json({ pending: [], replied: [] });
    }

    // Get all comment_replied events (successful replies) in the same window
    const { data: replied } = await supabase
      .from('analytics_events')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('event_type', 'comment_replied')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get all comment_reply_failed events
    const { data: failed } = await supabase
      .from('analytics_events')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('event_type', 'comment_reply_failed')
      .gte('created_at', sevenDaysAgo.toISOString());

    const repliedCommentIds = new Set(
      (replied || []).map(r => r.metadata?.comment_id).filter(Boolean)
    );
    const failedCommentIds = new Set(
      (failed || []).map(f => f.metadata?.comment_id).filter(Boolean)
    );

    // Categorize each matched comment
    const pending: typeof matched = [];
    const completed: typeof matched = [];

    for (const evt of matched) {
      const commentId = evt.metadata?.comment_id;
      if (!commentId) continue;

      if (repliedCommentIds.has(commentId)) {
        completed.push(evt);
      } else {
        // Mark as failed if it explicitly failed, otherwise it's pending/stuck
        pending.push({
          ...evt,
          metadata: {
            ...evt.metadata,
            status: failedCommentIds.has(commentId) ? 'failed' : 'pending',
          },
        });
      }
    }

    return NextResponse.json({ pending, completed });
  } catch (err: any) {
    console.error('[Queue] ❌ Failed to fetch pending comments:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
