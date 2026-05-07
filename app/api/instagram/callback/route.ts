import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getInstagramBusinessAccount } from "@/lib/instagram/oauth";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { createInstagramAccount } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/settings?error=access_denied", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?error=missing_params", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const userId = state.split(":")[1];
  if (!userId) {
    return NextResponse.redirect(
      new URL("/settings?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const igAccount = await getInstagramBusinessAccount(tokenData.access_token);

    const supabase = await getSupabaseServiceClient();

    await createInstagramAccount(supabase, {
      user_id: userId,
      instagram_id: igAccount.instagramId,
      username: igAccount.username,
      access_token: igAccount.accessToken,
      token_expires_at: igAccount.tokenExpiresAt.toISOString(),
    });

    return NextResponse.redirect(
      new URL("/settings?success=connected", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Instagram callback error:", message);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
