import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // We dismiss by injecting a 'comment_reply_failed' event which marks it as 'failed' instead of 'pending'.
    // Alternatively, we can just delete the 'comment_matched' event so it completely disappears. 
    // Deleting is cleaner to 'remove it'.
    const { error } = await supabase
      .from('analytics_events')
      .delete()
      .eq('user_id', user.id)
      .eq('event_type', 'comment_matched')
      .contains('metadata', { comment_id: commentId });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comment dismissed' });
  } catch (err: any) {
    console.error('[Queue] ❌ Failed to dismiss comment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
