import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // No auth check required here so anonymous users on /pricing can verify codes.

    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
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
