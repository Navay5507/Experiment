import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * POST /api/auth/meta/callback
 * 
 * Meta Data Deletion callback — Meta sends a signed request here
 * when a user requests deletion of their data from Meta's settings.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signedRequest = body.signed_request;

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
    }

    const [encodedSig, payload] = signedRequest.split('.');
    
    // Verify signature
    const appSecret = process.env.INSTAGRAM_APP_SECRET || '';
    if (!appSecret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const sigBuffer = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const expectedSigBuffer = crypto.createHmac('sha256', appSecret).update(payload).digest();

    if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      console.error('[Meta Callback] ❌ Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    const igUserId = decoded.user_id;

    if (igUserId) {
      // Clear the user's Instagram data
      await supabase
        .from('users')
        .update({
          instagramAccessToken: null,
          instagramUserId: null,
          instagramHandle: null,
        })
        .eq('instagramUserId', igUserId);

      console.log(`[Meta Callback] Data deletion processed for IG user: ${igUserId}`);
    }

    // Meta expects a JSON response with a confirmation URL and code
    const confirmationCode = `del_${Date.now()}`;
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://autodrop.co'}/privacy`,
      confirmation_code: confirmationCode,
    });
  } catch (err) {
    console.error('[Meta Callback] Error:', err);
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://autodrop.co'}/privacy`,
      confirmation_code: `del_error_${Date.now()}`,
    });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Data deletion endpoint active' });
}
