import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { redis } from '@/lib/queue/redis';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the internal user ID and plan from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerkId', clerkId)
      .single();

    let internalUserId = user?.id;
    let userPlan = user?.plan || 'FREE';

    // If user is not found in DB, it means Clerk webhook hasn't synced yet. Return a retryable error.
    if (!internalUserId || userError) {
      console.error(`[Automations] User not found in DB for clerkId=${clerkId}. Webhook sync may be delayed.`);
      return NextResponse.json(
        { error: 'Your account is still being set up. Please wait a few seconds and try again.' },
        { status: 503 }
      );
    }

    // PLAN ENFORCEMENT: Free users can only have 1 active automation
    // Wrap in a Redis mutex to prevent concurrent requests from racing past
    // the count check and both succeeding with count=0.
    if (userPlan === 'FREE') {
      const lockKey = `automation_create_lock:${internalUserId}`;
      const lock = await redis.set(lockKey, '1', 'EX', 30, 'NX');
      if (lock !== 'OK') {
        return NextResponse.json(
          { error: 'A request is already in progress. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      const { count } = await supabase
        .from('automations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', internalUserId)
        .eq('is_active', true);

      if ((count || 0) >= 1) {
        await redis.del(lockKey); // Release lock on early return
        return NextResponse.json(
          { error: 'Free tier limit reached. You can only have 1 active automation at a time. Please upgrade to Pro for unlimited automations.' },
          { status: 403 }
        );
      }
      // Lock is held — it will expire in 30s or be released after insert
    }

    const payload = await req.json();

    // PLAN ENFORCEMENT: Free users cannot use Pro features
    if (userPlan === 'FREE') {
      if (payload.featureType === 'follow_gate' || payload.featureType === 'lead_capture') {
        return NextResponse.json(
          { error: 'Follow-Gate and Lead Capture require a Pro plan. Please upgrade to unlock these features.' },
          { status: 403 }
        );
      }
      if (payload.targetType === 'story' || payload.targetType === 'dm') {
        return NextResponse.json(
          { error: 'Story and DM automations require a Pro plan. Please upgrade to unlock these features.' },
          { status: 403 }
        );
      }
      // HIGH-3 FIX: Combined atomic guard — prevents array injection and comma bypass
      if (payload.selectedPosts && (payload.selectedPosts.length > 1 || payload.selectedPosts.some((p: string) => String(p).includes(',')))) {
        return NextResponse.json(
          { error: 'Free plan allows a maximum of 1 post per automation. Please upgrade to Pro to select multiple posts.' },
          { status: 403 }
        );
      }
    }

    const newAutomation = {
      user_id: internalUserId,
      campaign_name: payload.campaignName || 'Unnamed Campaign',
      target_type: payload.targetType,
      instagram_media_id: payload.selectedPosts.join(','),
      keywords: payload.keywords ? payload.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
      reply_template: payload.replyTemplate,
      dm_link: payload.dmLink || null,
      dm_message: payload.dmMessage || null,
      dm_links: payload.dmLinks && payload.dmLinks.length > 0 ? payload.dmLinks : [],
      initial_dm_text: payload.initialDmText || 'Thanks for your interest! Tap below to get the link 👇',
      lead_capture_type: payload.featureType === 'lead_capture' ? 'email' : null,
      lead_capture_ask: payload.leadCaptureAsk || null,
      lead_capture_fields: payload.leadCaptureFields || [],
      follow_gate_enabled: payload.featureType === 'follow_gate',
      ai_enabled: payload.aiEnabled || false,
      ai_prompt: payload.aiPrompt || null,
      is_active: true
    };

    const { data: createdAutomation, error } = await supabase
      .from('automations')
      .insert([newAutomation])
      .select()
      .single();

    if (error) {
      console.error('Supabase automations insert error', error);
      // CRIT-1: Release lock on error path too
      if (userPlan === 'FREE') await redis.del(`automation_create_lock:${internalUserId}`);
      throw error;
    }

    // CRIT-1 FIX: Release creation mutex immediately after successful insert
    if (userPlan === 'FREE') await redis.del(`automation_create_lock:${internalUserId}`);
    return NextResponse.json(createdAutomation);

  } catch (error: unknown) {
    console.error('POST /api/automations Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
