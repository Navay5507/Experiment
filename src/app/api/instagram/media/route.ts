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

    let allMedia: any[] = [];
    
    // Helper to fetch paginated media
    const fetchAllPages = async (baseUrl: string) => {
      let url: string | null = baseUrl;
      let pagesCount = 0;
      
      while (url && pagesCount < 10) { // Max 1000 posts to avoid vercel timeout
        const res: Response = await fetch(url as string);
        const data = await res.json();
        
        if (data.error) {
          throw data.error;
        }
        
        if (data.data && Array.isArray(data.data)) {
          allMedia.push(...data.data);
        }
        
        url = data.paging?.next || null;
        pagesCount++;
      }
    };

    try {
      // First attempt using /me/media
      await fetchAllPages(`https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=100&access_token=${token}`);
    } catch (err: any) {
      console.warn(`[Instagram Media] /me/media failed, attempting fallback to /${igUserId}/media. Error:`, err);
      try {
        allMedia = []; // Reset and try fallback
        await fetchAllPages(`https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=100&access_token=${token}`);
      } catch (fallbackErr: any) {
        console.error('[Instagram Media] Graph API error on both endpoints:', fallbackErr);
        return NextResponse.json({ media: [], isConnected: true, error: fallbackErr.message || 'Error fetching media' });
      }
    }

    return NextResponse.json({ media: allMedia, isConnected: true });

  } catch (error) {
    console.error('[Instagram Media] Fetch error:', error);
    return NextResponse.json({ media: [], isConnected: false, error: 'Internal error' }, { status: 500 });
  }
}
