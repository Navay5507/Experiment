import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { commentQueue } from '@/lib/queue/queues';
import { getRandomDelay } from '@/lib/queue/dedup';
import { after } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/queue/retry-comment
 * 
 * Manually re-queues a comment for reply + DM chain.
 * Used from the dashboard logs page when a comment was missed.
 */
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { commentId, automationId, recipientId, commenterUsername } = await req.json();

    if (!commentId || !automationId) {
      return NextResponse.json({ error: 'Missing commentId or automationId' }, { status: 400 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Queue the comment reply with a short delay (5-15 seconds)
    await commentQueue.add('reply', {
      userId: user.id,
      automationId,
      commentId,
      recipientId: recipientId || undefined,
      commenterUsername: commenterUsername || '',
    }, { delay: getRandomDelay(5000, 15000) });

    console.log(`[Queue] ✅ Manual retry queued for comment ${commentId} by user ${user.id}`);

    // Keep alive so the worker can process this job
    after(async () => {
      console.log('[Retry] after() → keeping alive for worker...');
      await new Promise(resolve => setTimeout(resolve, 45000));
      console.log('[Retry] after() → done.');
    });

    return NextResponse.json({ success: true, message: 'Comment retry queued' });
  } catch (err: any) {
    console.error('[Queue] ❌ Failed to retry comment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
