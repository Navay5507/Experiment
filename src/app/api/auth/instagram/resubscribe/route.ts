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
    .select('id, instagramUserId, instagramAccessToken')
    .eq('clerkId', clerkId)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch all connected accounts
  const { data: conns } = await supabase
    .from('connected_accounts')
    .select('instagram_access_token, instagram_user_id, instagram_handle')
    .eq('user_id', user.id);

  const accounts = [];
  if (user.instagramAccessToken && user.instagramUserId) {
    accounts.push({
      token: user.instagramAccessToken,
      id: user.instagramUserId,
      handle: 'primary',
    });
  }
  if (conns) {
    for (const c of conns) {
      if (!accounts.some(a => a.id === c.instagram_user_id)) {
        accounts.push({
          token: c.instagram_access_token,
          id: c.instagram_user_id,
          handle: c.instagram_handle,
        });
      }
    }
  }

  if (accounts.length === 0) {
    return NextResponse.json({ error: 'No Instagram accounts connected' }, { status: 400 });
  }

  const results = [];
  let overallSuccess = true;

  for (const acc of accounts) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/me/subscribed_apps` +
        `?subscribed_fields=comments,messages` +
        `&access_token=${acc.token}`,
        { method: 'POST' }
      );
      const json = await res.json();
      console.log(`[Resubscribe] Result for @${acc.handle} (${acc.id}):`, JSON.stringify(json));
      if (json.success || json.data?.[0]?.success) {
        results.push({ id: acc.id, handle: acc.handle, success: true });
      } else {
        overallSuccess = false;
        results.push({ id: acc.id, handle: acc.handle, success: false, error: json.error?.message || 'Unknown error', raw: json });
      }
    } catch (err: any) {
      overallSuccess = false;
      results.push({ id: acc.id, handle: acc.handle, success: false, error: err.message });
    }
  }

  return NextResponse.json({
    success: overallSuccess,
    message: overallSuccess
      ? 'Webhook subscription active for all accounts! Real-time events will now work.'
      : 'Some accounts failed to re-subscribe to webhooks.',
    results,
  }, { status: overallSuccess ? 200 : 400 });
}
