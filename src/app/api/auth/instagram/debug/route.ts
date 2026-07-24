import { NextResponse } from 'next/server';

export async function GET() {
  const INSTAGRAM_APP_ID = (process.env.INSTAGRAM_APP_ID || '').trim();
  const META_APP_ID = (process.env.META_APP_ID || '').trim();
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').trim();

  const CLEAN_APP_URL = APP_URL.replace(/\/$/, '');
  const IG_REDIRECT_URI = CLEAN_APP_URL + '/api/auth/instagram/callback';
  const META_REDIRECT_URI = CLEAN_APP_URL + '/api/auth/meta/callback';

  return NextResponse.json({
    INSTAGRAM_APP_ID: INSTAGRAM_APP_ID || 'NOT SET',
    META_APP_ID: META_APP_ID || 'NOT SET',
    NEXT_PUBLIC_APP_URL: APP_URL || 'NOT SET',
    ig_redirect_uri_being_sent: IG_REDIRECT_URI,
    meta_redirect_uri_being_sent: META_REDIRECT_URI,
    message: 'Copy ig_redirect_uri_being_sent and add it EXACTLY to your Meta App > Instagram > Valid OAuth Redirect URIs'
  });
}
