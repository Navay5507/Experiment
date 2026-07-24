import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, plan, instagramUserId, instagramHandle, subscription_expires_at")
      .eq("clerkId", clerkId)
      .single();

    if (error || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const has_purchased_before = user.subscription_expires_at !== null;

    return NextResponse.json({ data: { ...user, has_purchased_before } });
  } catch (error: any) {
    console.error("[USER_PROFILE_GET_ERROR]:", error.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
