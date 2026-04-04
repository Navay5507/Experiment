import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Fetch the user's recent Instagram media from Graph API
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ media: [], error: 'Not authenticated' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('instagramAccessToken, instagramUserId')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user?.instagramAccessToken || !user?.instagramUserId) {
      return NextResponse.json({ media: [], isConnected: false, error: 'Instagram not connected' });
    }

    // Fetch recent media from Instagram Graph API
    // Use /me/media (works with both old and new Instagram Login API tokens)
    const response = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=12&access_token=${user.instagramAccessToken}`
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
