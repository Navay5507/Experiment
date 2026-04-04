import { NextResponse } from 'next/server';

// Visit https://autodrop-three.vercel.app/api/auth/instagram/debug
// to see exactly what environment variables Vercel has configured.
export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '(NOT SET)';
  const APP_ID = process.env.INSTAGRAM_APP_ID || '(NOT SET)';
  const HAS_SECRET = process.env.INSTAGRAM_APP_SECRET ? 'YES' : 'NO';
  const CLEAN_URL = APP_URL.trim().replace(/\/$/, '');
  const REDIRECT_URI = CLEAN_URL + '/api/auth/instagram/callback';

  const report = {
    message: 'Instagram OAuth Debug Report',
    environment: {
      NEXT_PUBLIC_APP_URL: APP_URL,
      INSTAGRAM_APP_ID: APP_ID,
      INSTAGRAM_APP_SECRET_EXISTS: HAS_SECRET,
    },
    computed: {
      REDIRECT_URI: REDIRECT_URI,
      AUTH_URL: `https://www.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments`,
    },
    instructions: 'Copy the REDIRECT_URI above and paste it EXACTLY into your Meta Developer Dashboard under Instagram > Valid OAuth Redirect URIs.',
  };

  return NextResponse.json(report, { status: 200 });
}
