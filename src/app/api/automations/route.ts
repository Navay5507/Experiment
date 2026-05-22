import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
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

    // Graceful fallback for local testing before the Clerk webhook sync is fully built
    if (!internalUserId || userError) {
        const fallbackId = crypto.randomUUID();
        const { data: newUser, error: insertError } = await supabase.from('users').insert({
          id: fallbackId,
          clerkId: clerkId,
          email: `test_${fallbackId.substring(0,6)}@example.com`,
          plan: 'PRO' // Default to PRO for testing/mocking
        }).select('id, plan').single();
        
        if (insertError) {
            console.error('Fallback user insert failed:', insertError);
            return NextResponse.json({ error: 'Failed to synchronize anonymous user' }, { status: 400 });
        }
        internalUserId = newUser.id;
        userPlan = newUser.plan;
    }

    // PLAN ENFORCEMENT: Free users can only have 1 active automation
    if (userPlan === 'FREE') {
      const { count } = await supabase
        .from('automations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', internalUserId)
        .eq('is_active', true);

      if ((count || 0) >= 1) {
        return NextResponse.json(
          { error: 'Free tier limit reached. You can only have 1 active automation at a time. Please upgrade to Pro for unlimited automations.' },
          { status: 403 }
        );
      }
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
      throw error;
    }

    return NextResponse.json(createdAutomation);

  } catch (error: unknown) {
    console.error('POST /api/automations Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
