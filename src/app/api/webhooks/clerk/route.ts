import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Clerk sends user.created / user.updated / user.deleted events here.
// Configure this endpoint in Clerk Dashboard → Webhooks.

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // If no webhook secret is configured, use a simpler verification
  const body = await req.text();
  const payload = JSON.parse(body);

  // Verify via Svix if secret is set, otherwise accept (dev mode)
  if (CLERK_WEBHOOK_SECRET) {
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
      const { error } = await supabase.from('users').insert({
        id: crypto.randomUUID(),
        clerkId: clerkId,
        email: email,
        plan: 'FREE',
      });

      if (error) {
        console.error('[Clerk Webhook] User insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`[Clerk Webhook] Created user: ${clerkId} / ${email}`);
    }
  }

  if (eventType === 'user.deleted') {
    const clerkId = data.id;
    // Cascade delete: automations, leads, analytics, then user
    const { data: user } = await supabase.from('users').select('id').eq('clerkId', clerkId).maybeSingle();
    if (user) {
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
