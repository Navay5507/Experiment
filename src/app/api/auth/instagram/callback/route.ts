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

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!user) {
      const newUserId = crypto.randomUUID();
      const { data: insertedUser } = await supabase.from('users').insert({
        id: newUserId,
        clerkId: clerkId,
        email: `${clerkId}@autodrop.co`,
        plan: 'FREE',
      }).select().maybeSingle();
      
      user = insertedUser;
    }

    if (!user) {
      throw new Error("Could not find or create user record");
    }

    const isPrimary = user.instagramUserId === igUserId;
    
    // Check if account is already connected in connected_accounts
    const { data: existingConn } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('instagram_user_id', igUserId)
      .maybeSingle();

    if (isPrimary || existingConn) {
      // Update existing connection
      if (isPrimary) {
        await supabase
          .from('users')
          .update({
            instagramAccessToken: finalToken,
            instagramTokenExpiresAt: expiresAt,
            instagramHandle: igHandle,
          })
          .eq('id', user.id);
      }
      
      await supabase
        .from('connected_accounts')
        .upsert({
          user_id: user.id,
          instagram_access_token: finalToken,
          instagram_user_id: igUserId,
          instagram_handle: igHandle || '',
          instagram_token_expires_at: expiresAt,
        }, { onConflict: 'user_id,instagram_user_id' });

    } else {
      // Connecting a brand NEW account!
      // Enforce plan limits (FREE = 1, PRO = 3, ELITE = unlimited)
      const { data: allConns } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', user.id);
      
      const currentCount = allConns?.length || 0;
      const limit = user.plan === 'FREE' ? 1 : user.plan === 'PRO' ? 3 : Infinity;

      if (currentCount >= limit) {
        console.warn(`[IG Callback] Limit reached for plan ${user.plan}: current=${currentCount}, limit=${limit}`);
        return NextResponse.redirect(new URL('?error=account_limit_reached', FRONTEND_DASHBOARD));
      }

      // If they don't have a primary account set yet, set this as primary in users
      if (!user.instagramAccessToken) {
        await supabase
          .from('users')
          .update({
            instagramAccessToken: finalToken,
            instagramUserId: igUserId,
            instagramHandle: igHandle,
            instagramTokenExpiresAt: expiresAt,
            onboardingSkipped: false,
          })
          .eq('id', user.id);
      }

      // Always insert into connected_accounts
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          instagram_access_token: finalToken,
          instagram_user_id: igUserId,
          instagram_handle: igHandle || '',
          instagram_token_expires_at: expiresAt,
        });
    }

    try {
      // Subscribe the Instagram account to receive webhook events
      const subRes = await fetch(
        `https://graph.instagram.com/v21.0/me/subscribed_apps` +
        `?subscribed_fields=comments,messages` +
        `&access_token=${finalToken}`,
        { method: 'POST' }
      );
      const subJson = await subRes.json();
      console.log('[IG Callback] Webhook subscription result:', JSON.stringify(subJson));
    } catch (subErr) { 
      console.error('[IG Callback] Webhook subscription failed:', subErr);
    }

    return NextResponse.redirect(new URL('?success=instagram_connected', FRONTEND_DASHBOARD));
  } catch (err) {
    console.error('[IG Callback] Exception:', err);
    return NextResponse.redirect(new URL('?error=ig_auth_failed', FRONTEND_DASHBOARD));
  }
}
