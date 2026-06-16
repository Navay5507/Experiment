import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// POST: Verify Razorpay payment and mark order as paid
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('[Store Verify] ❌ RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    const generated = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    let signatureValid = false;
    try {
      const sigBuffer = Buffer.from(razorpay_signature, 'utf8');
      const genBuffer = Buffer.from(generated, 'utf8');
      signatureValid = sigBuffer.length === genBuffer.length && crypto.timingSafeEqual(sigBuffer, genBuffer);
    } catch {
      signatureValid = false;
    }

    if (!signatureValid) {
      console.error('[Store Verify] Signature mismatch!');

      // Mark order as failed
      if (order_id) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', order_id);
      }

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment verified — update order
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_id: razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('*, product_id')
      .single();

    if (error || !order) {
      console.error('[Store Verify] Order update error:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update product sales count and revenue
    const { data: product } = await supabase
      .from('products')
      .select('total_sales, total_revenue, delivery_type, delivery_content')
      .eq('id', order.product_id)
      .single();

    if (product) {
      await supabase
        .from('products')
        .update({
          total_sales: (product.total_sales || 0) + 1,
          total_revenue: (product.total_revenue || 0) + order.amount,
        })
        .eq('id', order.product_id);
    }

    // Log analytics event
    await supabase.from('analytics_events').insert({
      user_id: order.seller_id,
      event_type: 'product_sold',
      metadata: {
        product_id: order.product_id,
        order_id: order.id,
        amount: order.amount,
        commission: order.commission_amount,
        payment_id: razorpay_payment_id,
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      delivery_type: product?.delivery_type,
      delivery_content: product?.delivery_content,
    });
  } catch (e) {
    console.error('[Store Verify] Error:', e);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
