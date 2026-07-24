import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await params;

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const { data: automation, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !automation) return NextResponse.json({ error: 'Automation not found.' }, { status: 404 });

    return NextResponse.json(automation);
  } catch (err) {
    console.error('GET /api/automations/[id] Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    // Get internal user and plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerkId', clerkId)
      .single();

    if (!user || userError) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const internalUserId = user.id;
    const userPlan = user.plan || 'FREE';

    // Verify ownership: the automation must belong to this user
    const { data: existing } = await supabase
      .from('automations')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', internalUserId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found.' }, { status: 404 });
    }

    const payload = await req.json();

    // PLAN ENFORCEMENT on edit (same as create)
    if (userPlan === 'FREE') {
      if (payload.featureType === 'follow_gate' || payload.featureType === 'lead_capture') {
        return NextResponse.json(
          { error: 'Follow-Gate and Lead Capture require a Pro plan.' },
          { status: 403 }
        );
      }
      if (payload.targetType === 'story' || payload.targetType === 'dm') {
        return NextResponse.json(
          { error: 'Story and DM automations require a Pro plan.' },
          { status: 403 }
        );
      }
      if (payload.selectedPosts && (payload.selectedPosts.length > 1 || payload.selectedPosts.some((p: string) => String(p).includes(',')))) {
        return NextResponse.json(
          { error: 'Free plan allows a maximum of 1 post per automation.' },
          { status: 403 }
        );
      }
    }

    // dmLinks arrive already encoded as strings (e.g. "Title|||https://url") from the client
    const dmLinks: string[] = (payload.dmLinks || []).filter((l: string) => typeof l === 'string' && l.trim() !== '');

    const updates = {
      campaign_name: payload.campaignName || 'Unnamed Campaign',
      target_type: payload.targetType,
      instagram_media_id: (payload.selectedPosts || []).join(','),
      keywords: payload.keywords
        ? payload.keywords.split(',').map((k: string) => k.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).filter(Boolean)
        : [],
      reply_template: payload.replyTemplate,
      dm_link: dmLinks.length > 0 ? dmLinks[0] : null,
      dm_message: payload.dmMessage || null,
      dm_links: dmLinks.length > 0 ? dmLinks : [],
      initial_dm_text: payload.initialDmText || 'Thanks for your interest! Tap below to get the link 👇',
      lead_capture_type: payload.featureType === 'lead_capture' ? 'email' : null,
      lead_capture_ask: payload.leadCaptureAsk || null,
      lead_capture_fields: payload.leadCaptureFields || [],
      follow_gate_enabled: payload.featureType === 'follow_gate',
      ai_enabled: payload.aiEnabled || false,
    };

    const { data: updated, error } = await supabase
      .from('automations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', internalUserId)
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/automations/[id]] Supabase error:', error);
      throw error;
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PUT /api/automations/[id] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
