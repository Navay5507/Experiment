import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { razorpay } from "@/lib/razorpay";

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
    const { error: updateError } = await supabase
      .from("users")
      .update({ plan: "PRO" })
      .eq("clerkId", clerkId);

    if (updateError) {
      console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR_DB]:", updateError.message);
      return new NextResponse("Database update failed", { status: 500 });
    }

    // ---- PROMO CODE USAGE TRACKING ----
    try {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      const promoCode = order.notes?.promo_code;
      
      if (promoCode) {
        // Increment the used_count for this coupon
        await supabase.rpc('increment_coupon_usage', { coupon_code: promoCode });
        // Note: we need to create this RPC, or just do an update, but supabase update without RPC doesn't support increment directly easily without fetching first, 
        // so we can fetch and update or just let it be slightly race-condition prone since it's just a coupon count.
        const { data: coupon } = await supabase.from('coupons').select('used_count').eq('code', promoCode).single();
        if (coupon) {
           await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('code', promoCode);
        }
      }
    } catch (e) {
      console.error("[PROMO_CODE_TRACKING_ERROR]:", e);
      // don't fail the request if coupon tracking fails
    }

    // ---- REFERRAL REWARD ----
    // Check if the purchasing user was referred by someone
    const { data: purchaser } = await supabase
      .from("users")
      .select("id, referred_by")
      .eq("clerkId", clerkId)
      .maybeSingle();

    if (purchaser?.referred_by) {
      // Mark the referral as completed — 25% commission tracked
      const { data: referral } = await supabase
        .from("referrals")
        .select("id, reward_applied")
        .eq("referrer_id", purchaser.referred_by)
        .eq("referred_user_id", purchaser.id)
        .eq("reward_applied", false)
        .maybeSingle();

      if (referral) {
        await supabase
          .from("referrals")
          .update({ status: "completed", reward_applied: true, reward_type: "commission_25pct" })
          .eq("id", referral.id);

        console.log(`[Referral] 25% commission activated for referral ${referral.id} (referrer: ${purchaser.referred_by})`);
      }
    }

    return NextResponse.json({ success: true, message: "Plan upgraded successfully" });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]:", error.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
