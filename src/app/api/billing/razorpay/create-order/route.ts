import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";
import { supabase } from "@/lib/supabase";

const rates: Record<string, { pro: number, elite: number }> = {
  USD: { pro: 9, elite: 99 },
  GBP: { pro: 7, elite: 79 },
  CAD: { pro: 12, elite: 135 },
  AUD: { pro: 13, elite: 149 },
  NZD: { pro: 14, elite: 164 },
  EUR: { pro: 9, elite: 89 },
  ZAR: { pro: 167, elite: 1880 },
  SGD: { pro: 12, elite: 133 },
  INR: { pro: 599, elite: 8200 },
  NGN: { pro: 11900, elite: 148500 },
};

const firstMonthRates: Record<string, number> = {
  USD: 1.99,
  GBP: 1.49,
  CAD: 1.99,
  AUD: 1.99,
  NZD: 1.99,
  EUR: 1.49,
  ZAR: 29,
  SGD: 1.99,
  INR: 99,
  NGN: 1990,
};
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("[RAZORPAY_CREATE_ORDER_ERROR]: Missing API keys in env.local.");
      return NextResponse.json({ error: "Razorpay keys not configured on server." }, { status: 500 });
    }

    const { currency = "INR", receipt, promoCode, billingCycle } = await req.json();

    // Fetch user to check if they have purchased before
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_expires_at")
      .eq("clerkId", clerkId)
      .single();

    const hasPurchasedBefore = userData?.subscription_expires_at !== null;
    const isAnnual = billingCycle === 'annual';

    // Determine secure base amount
    let baseTierPrice = rates[currency]?.pro || rates["INR"].pro;
    if (!hasPurchasedBefore && !isAnnual) {
      baseTierPrice = firstMonthRates[currency] || 99;
    }

    // Apply annual discount if needed (annual gets 40.07% off, billed 12 months)
    let finalAmount = isAnnual ? Math.round(baseTierPrice * (359 / 599)) * 12 : baseTierPrice;

    if (!finalAmount || finalAmount < 0) {
      return NextResponse.json({ error: "Invalid payment amount calculated." }, { status: 400 });
    }

    // Apply promo code logic securely on the backend
    if (promoCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", promoCode.trim().toUpperCase())
        .single();

      if (coupon && coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (coupon.max_uses === null || coupon.used_count < coupon.max_uses)) {
        if (coupon.discount_type === "percentage") {
          finalAmount = finalAmount - (finalAmount * (coupon.discount_value / 100));
        } else if (coupon.discount_type === "fixed") {
          finalAmount = Math.max(0, finalAmount - coupon.discount_value);
        }
      }
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    // Receipt has a 40 character limit.
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency,
      notes: {
        promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
        billing_cycle: billingCycle || 'monthly',
      },
      receipt: (receipt || `rcpt_${Date.now()}`).substring(0, 40),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]:", error);
    // Return specific error message from the razorpay object if possible.
    const errorMsg = error?.error?.description || error.message || "Failed to create payment order";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
