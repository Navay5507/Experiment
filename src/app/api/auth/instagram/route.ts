import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { encrypt } from '@/lib/crypto';

export async function GET() {
  // Read env vars at REQUEST TIME, not module load time
  const INSTAGRAM_APP_ID = (process.env.INSTAGRAM_APP_ID || '').trim();
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').trim();

  console.log("--- INSTAGRAM AUTH DIAGNOSTIC ---");
  console.log("INSTAGRAM_APP_ID:", INSTAGRAM_APP_ID);
  console.log("NEXT_PUBLIC_APP_URL:", APP_URL);

  if (!APP_URL) {
    return new NextResponse(
      'ERROR: NEXT_PUBLIC_APP_URL is not set in Vercel environment variables.\n' +
      'Go to Vercel > Settings > Environment Variables and add:\n' +
      'NEXT_PUBLIC_APP_URL = https://autodrop-three.vercel.app',
      { status: 500 }
    );
  }

  if (!INSTAGRAM_APP_ID) {
    return new NextResponse(
      'ERROR: INSTAGRAM_APP_ID is not set in Vercel environment variables.',
      { status: 500 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized: Must be logged into Autodrop first.', { status: 401 });
  }

  const CLEAN_APP_URL = APP_URL.replace(/\/$/, '');
  const REDIRECT_URI = CLEAN_APP_URL + '/api/auth/instagram/callback';

  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
  ].join(',');

  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scopes}` +
    `&force_authentication=1` +
    `&state=${encodeURIComponent(encrypt(userId))}`;

  console.log("REDIRECT_URI:", REDIRECT_URI);
  console.log("FINAL AUTH URL:", authUrl);
  console.log("--- END DIAGNOSTIC ---");

  return NextResponse.redirect(authUrl);
}
