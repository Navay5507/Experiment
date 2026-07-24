import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { redis } from '@/lib/queue/redis';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getCurrentHourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Fetch user row to get internal id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', userId)
      .maybeSingle();

    const internalUserId = user?.id || userId;
    const hourKey = getCurrentHourKey();

    // Read current hourly DM + comment counts from Redis
    const dmCountRaw = await redis.get(`dm_hourly:${internalUserId}:${hourKey}`).catch(() => null);
    const commentCountRaw = await redis.get(`comment_hourly:${internalUserId}:${hourKey}`).catch(() => null);
    const dmCount = parseInt(String(dmCountRaw || '0'), 10);
    const commentCount = parseInt(String(commentCountRaw || '0'), 10);

    // Queue depth
    const pendingDMs = await redis.llen('bull:autodrop-queue:wait').catch(() => 0);
    const activeDMs = await redis.llen('bull:autodrop-queue:active').catch(() => 0);

    // Redis latency
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;

    // Fetch automations with variant info
    const { data: automations } = await supabase
      .from('automations')
      .select('id, campaign_name, reply_template, dm_message, is_active')
      .eq('userId', internalUserId);

    const automationSafety = (automations || []).map((a: any) => {
      // Count spintax variants in reply_template or dm_message
      const template = a.reply_template || a.dm_message || '';
      const spintaxMatches = template.match(/\{[^}]+\}/g) || [];
      // Count options in each spintax group
      const variantCount = spintaxMatches.reduce((max: number, group: string) => {
        const options = group.slice(1, -1).split('|');
        return Math.max(max, options.length);
      }, spintaxMatches.length === 0 ? 1 : 1);

      return {
        id: a.id,
        name: a.campaign_name,
        isActive: a.is_active,
        variantCount,
        hasSpintax: spintaxMatches.length > 0,
      };
    });

    // Safety score calculation
    const DM_LIMIT = 150;
    const COMMENT_LIMIT = 600;
    const dmPct = (dmCount / DM_LIMIT) * 100;
    const commentPct = (commentCount / COMMENT_LIMIT) * 100;
    const maxPct = Math.max(dmPct, commentPct);

    let safetyScore = 100;
    if (maxPct > 90) safetyScore = 30;
    else if (maxPct > 75) safetyScore = 65;
    else if (maxPct > 50) safetyScore = 82;
    else safetyScore = 100;

    // Deduct for automations with no spintax
    const activeWithNoSpintax = automationSafety.filter((a: any) => a.isActive && !a.hasSpintax).length;
    safetyScore = Math.max(20, safetyScore - activeWithNoSpintax * 10);

    return NextResponse.json({
      safetyScore,
      dmCount,
      dmLimit: DM_LIMIT,
      commentCount,
      commentLimit: COMMENT_LIMIT,
      pendingQueue: (pendingDMs || 0) + (activeDMs || 0),
      redisLatency: latency,
      automationSafety,
    });
  } catch (err: any) {
    console.error('[Safety Status]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
