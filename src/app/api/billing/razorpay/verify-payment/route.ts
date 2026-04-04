import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new NextResponse("Invalid payment data", { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Update the user's plan in Supabase to PRO
    // The user's clerkId is our link.
    const { error: updateError } = await supabase
      .from("users")
      .update({ plan: "PRO" })
      .eq("clerkId", clerkId);

    if (updateError) {
      console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR_DB]:", updateError.message);
      return new NextResponse("Database update failed", { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Plan upgraded successfully" });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]:", error.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
