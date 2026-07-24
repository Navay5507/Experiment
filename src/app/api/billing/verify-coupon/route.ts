import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/queue/redis";

export async function POST(req: Request) {
  try {
    // HIGH-4 FIX: IP-based rate limiting to prevent coupon code enumeration
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const rateLimitKey = `coupon_rate:${ip}`;
    const attempts = await redis.incr(rateLimitKey);
    if (attempts === 1) await redis.expire(rateLimitKey, 3600); // 1 hour window
    if (attempts > 10) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    // No auth check required here so anonymous users on /pricing can verify codes.

    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Hardcoded special 3-month free trial coupon
    if (normalizedCode === 'TEST3M') {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const { data: userData } = await supabase.from("users").select("subscription_expires_at").eq("clerkId", clerkId).single();
        if (userData?.subscription_expires_at !== null) {
          return NextResponse.json({ error: "This trial code is for new customers only and can only be used once." }, { status: 400 });
        }
      }

      return NextResponse.json({
        valid: true,
        code: 'TEST3M',
        discount_type: 'percentage',
        discount_value: 100
      });
    }

    // Fetch the coupon from the database
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: "Promo code is no longer active" }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: "Promo code has reached its usage limit" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    });

  } catch (error: any) {
    console.error("[VERIFY_COUPON_ERROR]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
