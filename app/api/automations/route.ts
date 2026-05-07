import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  getAutomationsByUserId,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  countActiveAutomationsByUserId,
  getUserById,
} from "@/lib/supabase/queries";
import { PLAN_LIMITS } from "@/types/billing";
import type { CreateAutomationInput, UpdateAutomationInput } from "@/types/automation";

const DEV_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET() {
  try {
    const supabase = await getSupabaseServiceClient();
    const automations = await getAutomationsByUserId(supabase, DEV_USER_ID);
    return NextResponse.json({ automations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServiceClient();
    const body = (await request.json()) as CreateAutomationInput;

    // Enforce plan limits
    const user = await getUserById(supabase, DEV_USER_ID);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const limits = PLAN_LIMITS[user.plan];
    const activeCount = await countActiveAutomationsByUserId(supabase, DEV_USER_ID);

    if (activeCount >= limits.maxActiveAutomations) {
      return NextResponse.json(
        { error: `Free plan allows max ${limits.maxActiveAutomations} active automation. Upgrade to Pro for unlimited.` },
        { status: 403 }
      );
    }

    if (body.gate_type === "follow" && !limits.hasFollowGate) {
      return NextResponse.json({ error: "Follow-gate requires Pro plan" }, { status: 403 });
    }
    if (body.gate_type === "lead" && !limits.hasLeadCapture) {
      return NextResponse.json({ error: "Lead capture requires Pro plan" }, { status: 403 });
    }

    const automation = await createAutomation(supabase, {
      ...body,
      user_id: DEV_USER_ID,
    });

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServiceClient();
    const body = (await request.json()) as UpdateAutomationInput & { id: string };
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Missing automation id" }, { status: 400 });

    const automation = await updateAutomation(supabase, id, updates);
    return NextResponse.json({ automation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServiceClient();
    const { id } = (await request.json()) as { id: string };

    if (!id) return NextResponse.json({ error: "Missing automation id" }, { status: 400 });

    await deleteAutomation(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
