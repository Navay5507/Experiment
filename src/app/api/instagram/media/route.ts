import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { safeDecrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

// Fetch the user's recent Instagram media from Graph API
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ media: [], error: 'Not authenticated' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, instagramAccessToken, instagramUserId')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ media: [], isConnected: false, error: 'User not found' }, { status: 404 });
    }

    let token = safeDecrypt(user.instagramAccessToken);
    let igUserId = user.instagramUserId;

    if (accountId && accountId !== user.instagramUserId) {
      const { data: conn } = await supabase
        .from('connected_accounts')
        .select('instagram_access_token, instagram_user_id')
        .eq('user_id', user.id)
        .eq('instagram_user_id', accountId)
        .maybeSingle();

      if (conn) {
        token = safeDecrypt(conn.instagram_access_token);
        igUserId = conn.instagram_user_id;
      }
    }

    if (!token || !igUserId) {
      return NextResponse.json({ media: [], isConnected: false, error: 'Instagram not connected' });
    }

    // Fetch recent media from Instagram Graph API
    // Use /me/media (works with both old and new Instagram Login API tokens)
    const response = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=12&access_token=${token}`
    );
    const data = await response.json();

    if (data.error) {
      console.error('[Instagram Media] Graph API error:', data.error);
      return NextResponse.json({ media: [], isConnected: true, error: data.error.message });
    }

    return NextResponse.json({ media: data.data || [], isConnected: true });

  } catch (error) {
    console.error('[Instagram Media] Fetch error:', error);
    return NextResponse.json({ media: [], isConnected: false, error: 'Internal error' }, { status: 500 });
  }
}
