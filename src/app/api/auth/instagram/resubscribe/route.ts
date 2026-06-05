import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// POST /api/auth/instagram/resubscribe
// Re-subscribes the current user's Instagram account to receive webhooks.
// Call this once to fix accounts connected before the subscription bug was fixed.
export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase
    .from('users')
    .select('instagramUserId, instagramAccessToken')
    .eq('clerkId', clerkId)
    .maybeSingle();

  if (!user?.instagramUserId || !user?.instagramAccessToken) {
    return NextResponse.json({ error: 'No Instagram account connected' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${user.instagramUserId}/subscribed_apps` +
      `?subscribed_fields=comments,messages,live_comments,message_reactions,messaging_referral` +
      `&access_token=${user.instagramAccessToken}`,
      { method: 'POST' }
    );
    const json = await res.json();
    console.log('[Resubscribe] Result:', JSON.stringify(json));

    if (json.success) {
      return NextResponse.json({ success: true, message: 'Webhook subscription active! Real-time events will now work.' });
    } else {
      return NextResponse.json({ success: false, error: json.error?.message || 'Unknown error', raw: json }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
