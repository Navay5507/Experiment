import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET(req: Request) {
  const INSTAGRAM_APP_ID = (process.env.INSTAGRAM_APP_ID || '').trim();
  const INSTAGRAM_APP_SECRET = (process.env.INSTAGRAM_APP_SECRET || '').trim();
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').trim();

  if (!APP_URL || !INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
    return new NextResponse(
      `Missing env vars. APP_URL=${APP_URL ? 'set' : 'MISSING'}, APP_ID=${INSTAGRAM_APP_ID ? 'set' : 'MISSING'}, SECRET=${INSTAGRAM_APP_SECRET ? 'set' : 'MISSING'}`,
      { status: 500 }
    );
  }

  const CLEAN_APP_URL = APP_URL.replace(/\/$/, '');
  const REDIRECT_URI = CLEAN_APP_URL + '/api/auth/instagram/callback';
  const FRONTEND_DASHBOARD = CLEAN_APP_URL + '/dashboard';

  console.log('[IG Callback] Hit callback route');
  console.log('[IG Callback] REDIRECT_URI:', REDIRECT_URI);

  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const clerkId = searchParams.get('state');

  if (errorParam) {
    console.log('[IG Callback] User denied or error:', errorParam);
    return NextResponse.redirect(new URL('?error=ig_auth_denied', FRONTEND_DASHBOARD));
  }

  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  if (!clerkId) {
    return new NextResponse('Missing session state', { status: 401 });
  }

  try {
    console.log('[IG Callback] Exchanging code for token...');
    const cleanCode = code.replace(/#_$/, '');

    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID!,
        client_secret: INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: cleanCode,
      }),
    });
    const tokenData = await tokenRes.json();
    console.log('[IG Callback] Token response:', JSON.stringify(tokenData));

    let shortLivedToken: string;
    let igUserId: string;

    if (tokenData.data && Array.isArray(tokenData.data) && tokenData.data.length > 0) {
      shortLivedToken = tokenData.data[0].access_token;
      igUserId = String(tokenData.data[0].user_id);
    } else if (tokenData.access_token) {
      shortLivedToken = tokenData.access_token;
      igUserId = String(tokenData.user_id);
    } else {
      console.error('[IG Callback] Token exchange failed:', tokenData);
      throw new Error('Failed to retrieve Instagram access token');
    }

    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token` +
        `?grant_type=ig_exchange_token` +
        `&client_secret=${INSTAGRAM_APP_SECRET}` +
        `&access_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedRes.json();
    const finalToken = longLivedData.access_token || shortLivedToken;

    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${finalToken}`
    );
    const profileData = await profileRes.json();
    const igHandle = profileData.username || null;

    const expiresInSecs = longLivedData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresInSecs * 1000).toISOString();

    const updatePayload: any = {
      instagramAccessToken: finalToken,
      instagramUserId: igUserId,
      onboardingSkipped: false,
      instagramTokenExpiresAt: expiresAt,
    };
    if (igHandle) updatePayload.instagramHandle = igHandle;

    const { error: sbError, count } = await supabase
      .from('users')
      .update(updatePayload, { count: 'exact' })
      .eq('clerkId', clerkId);

    if (sbError || count === 0) {
      await supabase.from('users').insert({
        id: crypto.randomUUID(),
        clerkId: clerkId,
        email: `${clerkId}@autodrop.co`,
        plan: 'FREE',
        ...updatePayload,
      });
    }

    try {
      await fetch(
        `https://graph.instagram.com/v21.0/me/subscribed_apps` +
        `?subscribed_fields=comments,messages` +
        `&access_token=${finalToken}`,
        { method: 'POST' }
      );
    } catch (subErr) { /* non-blocking */ }

    return NextResponse.redirect(new URL('?success=instagram_connected', FRONTEND_DASHBOARD));
  } catch (err) {
    console.error('[IG Callback] Exception:', err);
    return NextResponse.redirect(new URL('?error=ig_auth_failed', FRONTEND_DASHBOARD));
  }
}
