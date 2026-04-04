import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";

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

    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    // Receipt has a 40 character limit.
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
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
