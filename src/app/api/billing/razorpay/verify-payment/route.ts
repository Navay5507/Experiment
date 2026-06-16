import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { razorpay } from "@/lib/razorpay";
import { Resend } from "resend";

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

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[Razorpay] ❌ RAZORPAY_KEY_SECRET is not configured');
      return new NextResponse("Server misconfigured", { status: 500 });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    try {
      const sigBuffer = Buffer.from(razorpay_signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return new NextResponse("Invalid signature", { status: 400 });
      }
    } catch {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Fetch the Razorpay order to get notes (billingCycle, promoCode)
    let order: any = null;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (e) {
      console.error("[RAZORPAY_FETCH_ORDER_ERROR]:", e);
    }

    // Calculate subscription expiry (monthly only — 30 days)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update the user's plan in Supabase to PRO with expiry date
    const { error: updateError } = await supabase
      .from("users")
      .update({ plan: "PRO", subscription_expires_at: expiresAt.toISOString() })
      .eq("clerkId", clerkId);

    if (updateError) {
      console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR_DB]:", updateError.message);
      return new NextResponse("Database update failed", { status: 500 });
    }

    // ---- PROMO CODE USAGE TRACKING ----
    try {
      if (order) {
        const promoCode = order.notes?.promo_code;
        if (promoCode) {
          const { data: coupon } = await supabase.from('coupons').select('used_count').eq('code', promoCode).single();
          if (coupon) {
            await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('code', promoCode);
          }
        }
      }
    } catch (e) {
      console.error("[PROMO_CODE_TRACKING_ERROR]:", e);
    }

    // ---- REFERRAL REWARD ----
    const { data: purchaser } = await supabase
      .from("users")
      .select("id, email, name, referred_by")
      .eq("clerkId", clerkId)
      .maybeSingle();

    if (purchaser?.referred_by) {
      const { data: referral } = await supabase
        .from("referrals")
        .select("id, reward_applied")
        .eq("referrer_id", purchaser.referred_by)
        .eq("referred_user_id", purchaser.id)
        .eq("reward_applied", false)
        .maybeSingle();

      if (referral) {
        const totalAmountPaid = order ? (order.amount / 100) : 0;
        const earnedAmount = totalAmountPaid > 0 ? (totalAmountPaid * 0.20) : 0;

        await supabase
          .from("referrals")
          .update({ 
            status: "completed", 
            reward_applied: true, 
            reward_type: "commission_20pct",
            earned_amount: earnedAmount 
          })
          .eq("id", referral.id);

        console.log(`[Referral] 20% commission activated for referral ${referral.id}`);
      }
    }

    // ---- WELCOME EMAIL ----
    try {
      const userEmail = purchaser?.email;
      const userName = purchaser?.name || '';
      if (userEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const planLabel = 'Monthly (30 Days)';
        const expiryFormatted = expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        await resend.emails.send({
          from: 'AutoDrop <noreply@autodrop.in>',
          to: userEmail,
          subject: '🎉 Welcome to AutoDrop Pro! Your automations are live.',
          html: `
            <!DOCTYPE html>
            <html>
              <body style="margin:0;padding:0;background:#0F172A;font-family:'Segoe UI',Arial,sans-serif;color:#F8FAFC;">
                <div style="max-width:560px;margin:40px auto;background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
                  <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;">AutoDrop Pro ✓</h1>
                  </div>
                  <div style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#F1F5F9;">You're all set, ${userName || 'Creator'}!</h2>
                    <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 20px;">
                      Your AutoDrop Pro plan (<strong style="color:#C7D2FE;">${planLabel}</strong>) is now active.
                      Unlimited automations, unlimited DMs, and lead capture are all unlocked and ready to go.
                    </p>
                    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                      <p style="margin:0;color:#64748B;font-size:13px;">Plan expires on</p>
                      <p style="margin:4px 0 0;color:#F1F5F9;font-size:17px;font-weight:700;">${expiryFormatted}</p>
                    </div>
                    <a href="https://autodrop.in/dashboard" 
                       style="display:inline-block;background:linear-gradient(135deg,#6B7CFF,#4F46E5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;">
                      Go to Dashboard →
                    </a>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        console.log(`[Email] Welcome email sent to ${userEmail}`);
      }
    } catch (emailErr) {
      console.error("[WELCOME_EMAIL_ERROR]:", emailErr);
      // Don't fail the payment if email fails
    }

    return NextResponse.json({ success: true, message: "Plan upgraded successfully" });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]:", error.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
