import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { safeDecrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID;

/**
 * POST /api/admin/resubscribe-user
 * Forces webhook re-subscription for a specific user's connected IG accounts.
 * Body: { userId: string }
 */
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (ADMIN_CLERK_ID && clerkId !== ADMIN_CLERK_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const { data: user } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken')
    .eq('id', userId)
    .maybeSingle();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: conns } = await supabase
    .from('connected_accounts')
    .select('instagram_access_token, instagram_user_id')
    .eq('user_id', userId);

  const accounts: { token: string; id: string }[] = [];

  if (user.instagramAccessToken && user.instagramUserId) {
    const t = safeDecrypt(user.instagramAccessToken);
    if (t) accounts.push({ token: t, id: user.instagramUserId });
  }
  if (conns) {
    for (const c of conns) {
      if (!accounts.some(a => a.id === c.instagram_user_id)) {
        const t = safeDecrypt(c.instagram_access_token);
        if (t) accounts.push({ token: t, id: c.instagram_user_id });
      }
    }
  }

  const results = [];
  for (const acc of accounts) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/me/subscribed_apps` +
        `?subscribed_fields=comments,messages` +
        `&access_token=${acc.token}`,
        { method: 'POST' }
      );
      const json = await res.json();
      console.log(`[Admin Resubscribe] IG ${acc.id}:`, JSON.stringify(json));
      results.push({ igUserId: acc.id, result: json });
    } catch (e: any) {
      results.push({ igUserId: acc.id, error: e.message });
    }
  }

  return NextResponse.json({ success: true, accountsProcessed: accounts.length, results });
}
