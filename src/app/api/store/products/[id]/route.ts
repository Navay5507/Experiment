import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// PATCH: Update a product
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'price', 'currency', 'product_type', 'delivery_type', 'delivery_content', 'cover_image_url', 'is_active'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ product });
  } catch (e) {
    console.error('[Store API] PATCH product error:', e);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Store API] DELETE product error:', e);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// GET: Get a single product (for editing)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Public endpoint — no auth required (used by checkout page)
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, description, price, currency, product_type, cover_image_url, is_active, user_id')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get seller info for the checkout page
    const { data: seller } = await supabase
      .from('users')
      .select('instagramHandle, name')
      .eq('id', product.user_id)
      .single();

    return NextResponse.json({
      product: {
        ...product,
        seller_name: seller?.name || seller?.instagramHandle || 'Creator',
        seller_handle: seller?.instagramHandle,
      }
    });
  } catch (e) {
    console.error('[Store API] GET product error:', e);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
