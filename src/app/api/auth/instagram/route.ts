import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL is not configured in Vercel environment variables.");
}
const CLEAN_APP_URL = APP_URL.replace(/\/$/, '');
const REDIRECT_URI = CLEAN_APP_URL + '/api/auth/instagram/callback';

export async function GET() {
  console.log("Constructed Redirect URI:", REDIRECT_URI);
  console.log("Using Instagram App ID:", INSTAGRAM_APP_ID);
  if (!INSTAGRAM_APP_ID) {
    return new NextResponse('Instagram App ID not configured.', { status: 500 });
  }

  // Grab the Clerk session so we can pass it through the OAuth round-trip
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized: Must be logged into Autodrop first.', { status: 401 });
  }

  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
  ].join(',');

  // Pure Instagram authorization URL – NO Facebook involved
  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scopes}` +
    `&force_authentication=1` +
    `&state=${userId}`;

  return NextResponse.redirect(authUrl);
}
