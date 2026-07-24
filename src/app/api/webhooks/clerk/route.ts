import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Clerk sends user.created / user.updated / user.deleted events here.
// Configure this endpoint in Clerk Dashboard → Webhooks.

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char hex
}

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // If no webhook secret is configured, use a simpler verification
  const body = await req.text();
  const payload = JSON.parse(body);

  // Verify via Svix — MANDATORY (never skip in production)
  if (!CLERK_WEBHOOK_SECRET) {
    console.error('[Clerk Webhook] ❌ CLERK_WEBHOOK_SECRET is not configured — rejecting');
    return new NextResponse('Server misconfigured', { status: 500 });
  }

  try {
    const svixId = req.headers.get('svix-id') || '';
    const svixTimestamp = req.headers.get('svix-timestamp') || '';
    const svixSignature = req.headers.get('svix-signature') || '';

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature });
  } catch (err) {
    console.error('[Clerk Webhook] Signature verification failed:', err);
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const eventType = payload.type;
  const data = payload.data;

  console.log(`[Clerk Webhook] Event: ${eventType}`);

  if (eventType === 'user.created') {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || `${clerkId}@autodrop.co`;

    // Check if user already exists (avoid duplicates)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (!existing) {
      const newUserId = crypto.randomUUID();
      const referralCode = generateReferralCode();

      // Check for referral code from unsafeMetadata (set by sign-up page)
      const refCode = data.unsafe_metadata?.referral_code || null;
      let referredBy: string | null = null;

      if (refCode) {
        // Look up the referrer by their referral_code
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', refCode)
          .maybeSingle();

        if (referrer) {
          referredBy = referrer.id;
          console.log(`[Clerk Webhook] Referral found: new user referred by ${referrer.id} (code: ${refCode})`);

          // Create a pending referral record
          await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referred_user_id: newUserId,
            status: 'pending',
            reward_type: 'pro_days',
            reward_days: 7,
            reward_applied: false,
          });
        }
      }

      const { error } = await supabase.from('users').insert({
        id: newUserId,
        clerkId: clerkId,
        email: email,
        plan: 'FREE',
        referral_code: referralCode,
        referred_by: referredBy,
      });

      if (error) {
        console.error('[Clerk Webhook] User insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`[Clerk Webhook] Created user: ${clerkId} / ${email} (referral_code: ${referralCode})`);
    }
  }

  if (eventType === 'user.updated') {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || null;
    const firstName = data.first_name || null;
    const lastName = data.last_name || null;

    if (email) {
      const updateData: Record<string, string | null> = { email };
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerkId', clerkId);

      if (error) {
        console.error('[Clerk Webhook] User update error:', error);
      } else {
        console.log(`[Clerk Webhook] Updated user ${clerkId} email to: ${email}`);
      }
    }
  }

  if (eventType === 'user.deleted') {
    const clerkId = data.id;
    // Cascade delete: automations, leads, analytics, then user
    const { data: user } = await supabase.from('users').select('id').eq('clerkId', clerkId).maybeSingle();
    if (user) {
      await supabase.from('referrals').delete().or(`referrer_id.eq.${user.id},referred_user_id.eq.${user.id}`);
      await supabase.from('dm_conversations').delete().eq('user_id', user.id);
      await supabase.from('analytics_events').delete().eq('user_id', user.id);
      await supabase.from('leads').delete().eq('user_id', user.id);
      await supabase.from('automations').delete().eq('user_id', user.id);
      await supabase.from('users').delete().eq('id', user.id);
      console.log(`[Clerk Webhook] Deleted user and all data: ${clerkId}`);
    }
  }

  return NextResponse.json({ received: true });
}
