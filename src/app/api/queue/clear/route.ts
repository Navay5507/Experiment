import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dmQueue, commentQueue } from '@/lib/queue/queues';

export const dynamic = 'force-dynamic';

/**
 * POST /api/queue/clear
 * 
 * Drains all pending/waiting/delayed jobs from both BullMQ queues.
 * Only accessible by authenticated users.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure only the admin can clear the queues
  const adminId = process.env.ADMIN_CLERK_ID;
  if (!adminId || userId !== adminId) {
    return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  try {
    // Drain removes all jobs that are waiting or delayed
    await dmQueue.drain();
    await commentQueue.drain();

    // Also obliterate to clean up completed/failed jobs
    await dmQueue.obliterate({ force: true });
    await commentQueue.obliterate({ force: true });

    console.log(`[Queue] ✅ All queues cleared by user ${userId}`);
    return NextResponse.json({ success: true, message: 'All queues cleared successfully' });
  } catch (err: any) {
    console.error('[Queue] ❌ Failed to clear queues:', err);
    return NextResponse.json({ error: err.message || 'Failed to clear queues' }, { status: 500 });
  }
}
