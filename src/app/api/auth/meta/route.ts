import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const META_APP_ID = process.env.META_APP_ID;
const REDIRECT_URI = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/auth/meta/callback';

export async function GET() {
  if (!META_APP_ID) {
    return new NextResponse('Meta App ID not configured in ENV variables.', { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized: Must be logged into Autodrop first.', { status: 401 });
  }

  const permissions = [
    'instagram_manage_comments',
    'instagram_manage_messages',
    'pages_messaging',
    'instagram_basic',
    'pages_show_list'
  ].join(',');

  const setupExtras = encodeURIComponent(JSON.stringify({ setup: { channel: 'IG_API' } }));
  
  // Inject the Clerk userId as 'state' so we don't lose the session cookie across domains!
  let authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${permissions}&response_type=code&state=${userId}&extras=${setupExtras}`;

  const configId = process.env.META_LOGIN_CONFIG_ID;
  if (configId) {
    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${userId}&config_id=${configId}`;
  }

  return NextResponse.redirect(authUrl);
}
