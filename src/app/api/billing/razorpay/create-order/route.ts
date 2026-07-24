import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/queue/redis";

const rates: Record<string, { pro: number, elite: number }> = {
  USD: { pro: 4.99, elite: 99 },
  GBP: { pro: 3.99, elite: 79 },
  CAD: { pro: 6.99, elite: 135 },
  AUD: { pro: 7.99, elite: 149 },
  NZD: { pro: 8.99, elite: 164 },
  EUR: { pro: 4.99, elite: 89 },
  ZAR: { pro: 99, elite: 1880 },
  SGD: { pro: 6.99, elite: 133 },
  INR: { pro: 449, elite: 8200 },
  NGN: { pro: 6990, elite: 148500 },
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

    const { currency = "INR", receipt, promoCode, billingCycle, autorenew } = await req.json();
    
    // Sanitize receipt to max 40 chars to prevent Razorpay crashes
    const safeReceipt = (receipt || `order_${Date.now()}`).toString().slice(0, 40);

    // Fetch user to check if they have purchased before
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_expires_at")
      .eq("clerkId", clerkId)
      .single();

    const hasPurchasedBefore = userData?.subscription_expires_at !== null;

    // Determine secure base amount (monthly only)
    let baseTierPrice = rates[currency]?.pro || rates["INR"].pro;
    if (!hasPurchasedBefore) {
      baseTierPrice = firstMonthRates[currency] || 99;
    }

    let finalAmount = baseTierPrice;

    if (!finalAmount || finalAmount < 0) {
      return NextResponse.json({ error: "Invalid payment amount calculated." }, { status: 400 });
    }

    // Apply promo code logic securely on the backend
    let trialDays = 0;
    let promoLockKey: string | null = null; // CRIT-2: Track lock key for cleanup
    if (promoCode) {
      const normalizedCode = promoCode.trim().toUpperCase();

      // Mutex lock to prevent concurrent double-submit race conditions
      promoLockKey = `promo_lock:${clerkId}:${normalizedCode}`;
      const lock = await redis.set(promoLockKey, '1', 'EX', 300, 'NX');
      if (lock !== 'OK') {
        return NextResponse.json({ error: "Promo code is currently being processed. Please try again." }, { status: 429 });
      }

      if (normalizedCode === 'TEST3M') {
        if (hasPurchasedBefore) {
          // CRIT-2 FIX: Release lock on early rejection
          await redis.del(promoLockKey);
          return NextResponse.json({ error: "This trial code is for new customers only and can only be used once." }, { status: 400 });
        }
        finalAmount = 0;
        trialDays = 30;
      } else {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", normalizedCode)
          .single();

        if (coupon && coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (coupon.max_uses === null || coupon.used_count < coupon.max_uses)) {
          if (coupon.discount_type === "percentage") {
            finalAmount = finalAmount - (finalAmount * (coupon.discount_value / 100));
          } else if (coupon.discount_type === "fixed") {
            finalAmount = Math.max(0, finalAmount - coupon.discount_value);
          }

          if (coupon.trial_days && coupon.trial_days > 0) {
            trialDays = coupon.trial_days;
          }
        }
      }
    }

    if (trialDays > 0) {
      // Direct bypass: Grant PRO access instantly without Razorpay
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + trialDays);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ plan: "PRO", subscription_expires_at: expiresAt.toISOString() })
        .eq("clerkId", clerkId);

      if (updateError) {
        // CRIT-2 FIX: Release lock on error
        if (promoLockKey) await redis.del(promoLockKey);
        throw new Error("Failed to activate free trial");
      }
      
      // Update coupon usage
      if (promoCode && promoCode.trim().toUpperCase() !== 'TEST3M') {
        const { data: couponToUpdate } = await supabase.from('coupons').select('used_count').eq('code', promoCode.trim().toUpperCase()).single();
        if (couponToUpdate) {
          await supabase.from('coupons').update({ used_count: (couponToUpdate.used_count || 0) + 1 }).eq('code', promoCode.trim().toUpperCase());
        }
      }

      // CRIT-2 FIX: Release lock after successful grant
      if (promoLockKey) await redis.del(promoLockKey);
      return NextResponse.json({ bypassed: true, expiresAt: expiresAt.toISOString() });
    }

    let orderData: any;

    if (autorenew) {
       // Create a Plan on the fly for the exact amount
       const planName = `Growth Pro (Monthly) - ${currency}`;
       const plan = await razorpay.plans.create({
         period: "monthly",
         interval: 1,
         item: {
           name: planName,
           amount: Math.round(finalAmount * 100),
           currency,
           description: `Auto-renewing subscription for ${planName}`
         }
       });

       const subscriptionPayload: any = {
         plan_id: plan.id,
         customer_notify: 1,
         total_count: 120, // 10 years of monthly billing
         notes: {
           promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
           billing_cycle: billingCycle || 'monthly',
           trial_days: trialDays > 0 ? trialDays.toString() : null
         }
       };

       if (trialDays > 0) {
         subscriptionPayload.start_at = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);
       }

       orderData = await razorpay.subscriptions.create(subscriptionPayload);
       // Add the amount/currency so frontend can use it if needed
       orderData.amount = Math.round(finalAmount * 100);
       orderData.currency = currency;
    } else {
       orderData = await razorpay.orders.create({
         amount: Math.round(finalAmount * 100),
         currency,
         notes: {
           clerk_id: clerkId,
           promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
           billing_cycle: billingCycle || 'monthly',
         },
         receipt: safeReceipt,
       });
    }

    // CRIT-2 FIX: Release lock after successful order creation
    if (promoLockKey) await redis.del(promoLockKey);
    return NextResponse.json(orderData);
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]:", error);
    // Return specific error message from the razorpay object if possible.
    const errorMsg = error?.error?.description || error.message || "Failed to create payment order";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
