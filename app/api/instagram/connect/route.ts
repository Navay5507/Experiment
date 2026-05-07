import { NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/instagram/oauth";
import crypto from "crypto";

// Dev user ID — replaced with Clerk auth().userId in Phase 10
const DEV_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex") + ":" + DEV_USER_ID;
  const authUrl = getInstagramAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
