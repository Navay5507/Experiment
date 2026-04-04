import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not configured in Vercel environment variables.");
}
const CLEAN_APP_URL = APP_URL.replace(/\/$/, '');
const REDIRECT_URI = CLEAN_APP_URL + '/api/auth/instagram/callback';
const FRONTEND_DASHBOARD = CLEAN_APP_URL + '/dashboard';

export async function GET(req: Request) {
  console.log('[IG Callback] Hit callback route');
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
    // ── Step 1: Exchange code for short-lived token ──────────────────
    // Instagram Login uses a POST with form-data to api.instagram.com
    console.log('[IG Callback] Exchanging code for token...');

    // Strip the trailing #_ that Instagram appends to the code
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

    // The response shape is { data: [{ access_token, user_id, permissions }] }
    // or for older format: { access_token, user_id }
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

    console.log('[IG Callback] Got short-lived token for IG user:', igUserId);

    // ── Step 2: Exchange for long-lived token (60 days) ──────────────
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token` +
        `?grant_type=ig_exchange_token` +
        `&client_secret=${INSTAGRAM_APP_SECRET}` +
        `&access_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedRes.json();
    const finalToken = longLivedData.access_token || shortLivedToken;
    console.log('[IG Callback] Long-lived token obtained, expires in:', longLivedData.expires_in);

    // ── Step 3: Get Instagram username ───────────────────────────────
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${finalToken}`
    );
    const profileData = await profileRes.json();
    const igHandle = profileData.username || null;
    console.log('[IG Callback] Instagram handle:', igHandle);

    // ── Step 4: Save to Supabase ─────────────────────────────────────
    const expiresInSecs = longLivedData.expires_in || 5184000; // default 60 days
    const expiresAt = new Date(Date.now() + expiresInSecs * 1000).toISOString();

    const updatePayload: Record<string, string | null | boolean> = {
      instagramAccessToken: finalToken,
      instagramUserId: igUserId,
      onboardingSkipped: false,
      instagramTokenExpiresAt: expiresAt,
    };
    if (igHandle) updatePayload.instagramHandle = igHandle;

    // Try update first
    const { error: sbError, count } = await supabase
      .from('users')
      .update(updatePayload, { count: 'exact' })
      .eq('clerkId', clerkId);

    if (sbError) {
      console.error('[IG Callback] Supabase update failed:', sbError);
    } else if (count === 0) {
      // User row doesn't exist yet (Clerk webhook never fired) — create it
      console.log('[IG Callback] No user row found for clerkId, creating one...');
      const { error: insertError } = await supabase.from('users').insert({
        id: crypto.randomUUID(),
        clerkId: clerkId,
        email: `${clerkId}@autodrop.co`,
        plan: 'FREE',
        ...updatePayload,
      });
      if (insertError) {
        console.error('[IG Callback] User insert failed:', insertError);
      } else {
        console.log(`[IG Callback] ✅ Created user + connected @${igHandle} (ID: ${igUserId}) for Clerk: ${clerkId}`);
      }
    } else {
      console.log(`[IG Callback] ✅ Connected @${igHandle} (ID: ${igUserId}) for Clerk: ${clerkId}`);
    }

    // ── Step 5: Subscribe account to receive webhook notifications ────
    // This is REQUIRED — without it, Meta won't send comment/message events
    try {
      const subRes = await fetch(
        `https://graph.instagram.com/v21.0/me/subscribed_apps` +
        `?subscribed_fields=comments,messages` +
        `&access_token=${finalToken}`,
        { method: 'POST' }
      );
      const subData = await subRes.json();
      if (subData.success) {
        console.log('[IG Callback] ✅ Webhook subscription activated (comments + messages)');
      } else {
        console.error('[IG Callback] ⚠️ Webhook subscription failed:', subData);
      }
    } catch (subErr) {
      console.error('[IG Callback] ⚠️ Webhook subscription error:', subErr);
    }

    return NextResponse.redirect(new URL('?success=instagram_connected', FRONTEND_DASHBOARD));
  } catch (err) {
    console.error('[IG Callback] Exception:', err);
    return NextResponse.redirect(new URL('?error=ig_auth_failed', FRONTEND_DASHBOARD));
  }
}
