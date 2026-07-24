import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { razorpay } from '@/lib/razorpay';

// POST: Create a Razorpay order for a product purchase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, buyer_email, buyer_name } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    // Fetch the product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*, user_id')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    if (product.price <= 0) {
      // Free product — create order directly as paid
      const { data: order } = await supabase
        .from('orders')
        .insert({
          product_id: product.id,
          seller_id: product.user_id,
          buyer_email: buyer_email || null,
          buyer_name: buyer_name || null,
          amount: 0,
          commission_amount: 0,
          currency: product.currency,
          payment_status: 'paid',
          payment_id: `free_${Date.now()}`,
        })
        .select()
        .single();

      // Update product sales count
      await supabase
        .from('products')
        .update({
          total_sales: (product.total_sales || 0) + 1,
        })
        .eq('id', product.id);

      return NextResponse.json({
        order_id: order?.id,
        is_free: true,
        delivery_type: product.delivery_type,
        delivery_content: product.delivery_content,
      });
    }

    // Get seller info for commission calculation
    const { data: seller } = await supabase
      .from('users')
      .select('monetization_model, commission_rate, plan')
      .eq('id', product.user_id)
      .single();

    // Calculate commission
    let commissionAmount = 0;
    const commissionRate = seller?.commission_rate || 10;
    if (seller?.monetization_model === 'commission') {
      commissionAmount = Math.round((product.price * commissionRate) / 100 * 100) / 100;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(product.price * 100), // Razorpay expects paise
      currency: product.currency || 'INR',
      receipt: `prod_${product.id}_${Date.now()}`,
      notes: {
        product_id: product.id,
        seller_id: product.user_id,
        product_name: product.name,
      },
    });

    // Create order record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        product_id: product.id,
        seller_id: product.user_id,
        buyer_email: buyer_email || null,
        buyer_name: buyer_name || null,
        amount: product.price,
        commission_amount: commissionAmount,
        currency: product.currency,
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    return NextResponse.json({
      order_id: order?.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      product_name: product.name,
      seller_name: product.name,
    });
  } catch (e) {
    console.error('[Store Orders] Create order error:', e);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
