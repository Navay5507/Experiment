import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getInstagramAccountsByUserId } from "@/lib/supabase/queries";
import { getUserMedia } from "@/lib/instagram/graph-api";

// Dev user ID — replaced with Clerk auth().userId in Phase 10
const DEV_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get("account_id");

  try {
    const supabase = await getSupabaseServiceClient();
    const accounts = await getInstagramAccountsByUserId(supabase, DEV_USER_ID);

    if (accounts.length === 0) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
    }

    const account = accountId
      ? accounts.find((a) => a.id === accountId)
      : accounts[0];

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const posts = await getUserMedia(account.instagram_id, {
      accessToken: account.access_token,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Fetch posts error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
