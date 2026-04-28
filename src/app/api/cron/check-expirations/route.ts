import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { downgradeUserToFree } from '@/lib/billing/downgrade';
import { sendPlanExpiryWarning, sendPlanExpiredEmail } from '@/lib/email/resend';

// This endpoint is called daily by Vercel Cron at midnight
// It checks for expiring/expired plans and sends emails accordingly.
export async function GET(req: Request) {
  // Secure the cron endpoint — only allow Vercel Cron or calls with the service role key
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const results = { warned3days: 0, warned1day: 0, expired: 0, errors: [] as string[] };

  try {
    // --- 1. 3-DAY WARNING ---
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const in2Days = new Date(now);
    in2Days.setDate(in2Days.getDate() + 2);

    const { data: expiring3 } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('plan', 'PRO')
      .gte('subscription_expires_at', in2Days.toISOString())
      .lte('subscription_expires_at', in3Days.toISOString());

    for (const user of expiring3 || []) {
      try {
        await sendPlanExpiryWarning(user.email, user.name, 3);
        results.warned3days++;
      } catch (e: any) {
        results.errors.push(`3day-warn ${user.email}: ${e.message}`);
      }
    }

    // --- 2. 1-DAY WARNING ---
    const in1Day = new Date(now);
    in1Day.setDate(in1Day.getDate() + 1);
    const in0Days = new Date(now); // now

    const { data: expiring1 } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('plan', 'PRO')
      .gte('subscription_expires_at', in0Days.toISOString())
      .lte('subscription_expires_at', in1Day.toISOString());

    for (const user of expiring1 || []) {
      try {
        await sendPlanExpiryWarning(user.email, user.name, 1);
        results.warned1day++;
      } catch (e: any) {
        results.errors.push(`1day-warn ${user.email}: ${e.message}`);
      }
    }

    // --- 3. EXPIRED — Downgrade and notify ---
    const { data: expired } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('plan', 'PRO')
      .lt('subscription_expires_at', now.toISOString());

    for (const user of expired || []) {
      try {
        // Downgrade user and pause excess automations
        await downgradeUserToFree(user.id);
        // Notify them by email
        await sendPlanExpiredEmail(user.email, user.name);
        results.expired++;
      } catch (e: any) {
        results.errors.push(`expire ${user.email}: ${e.message}`);
      }
    }

    console.log('[Cron] check-expirations complete:', results);
    return NextResponse.json({ ok: true, ...results });
  } catch (error: any) {
    console.error('[Cron] check-expirations fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
