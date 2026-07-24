import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. Get User ID and UPI ID
    const { data: user } = await supabase
      .from("users")
      .select("id, upi_id")
      .eq("clerkId", clerkId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.upi_id) {
      return NextResponse.json({ error: "Please save your UPI ID before withdrawing." }, { status: 400 });
    }

    // 2. Verify Available Balance
    // Sum of earned amounts
    const { data: referrals } = await supabase
      .from("referrals")
      .select("earned_amount")
      .eq("referrer_id", user.id)
      .eq("status", "completed");

    const totalEarned = (referrals || []).reduce((sum, r) => sum + Number(r.earned_amount || 0), 0);

    // Sum of previous withdrawals
    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("amount")
      .eq("affiliate_id", user.id)
      .in("status", ["pending", "paid"]);

    const totalWithdrawn = (withdrawals || []).reduce((sum, w) => sum + Number(w.amount || 0), 0);

    const availableBalance = totalEarned - totalWithdrawn;

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
    }

    // 3. Create Withdrawal Request
    const { error: insertError } = await supabase
      .from("withdrawals")
      .insert({
        affiliate_id: user.id,
        amount: Number(amount),
        status: "pending",
        payout_method: "upi",
        payout_details: user.upi_id
      });

    if (insertError) {
      console.error("[WITHDRAWAL_INSERT_ERROR]:", insertError);
      return NextResponse.json({ error: "Failed to create withdrawal request." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Withdrawal requested successfully" });

  } catch (error: any) {
    console.error("[WITHDRAWAL_REQUEST_ERROR]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
