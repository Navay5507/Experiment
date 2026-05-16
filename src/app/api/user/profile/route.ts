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
      .select("id, email, plan, instagramUserId, instagramHandle")
      .eq("clerkId", clerkId)
      .single();

    if (error || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error: any) {
    console.error("[USER_PROFILE_GET_ERROR]:", error.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
