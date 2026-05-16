import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET: List all products for the authenticated user
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products: products || [] });
  } catch (e) {
    console.error('[Store API] GET products error:', e);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerkId', clerkId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { name, description, price, currency, product_type, delivery_type, delivery_content, cover_image_url } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        price: Number(price),
        currency: currency || 'INR',
        product_type: product_type || 'digital',
        delivery_type: delivery_type || 'link',
        delivery_content: delivery_content || '',
        cover_image_url: cover_image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error('[Store API] POST product error:', e);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
