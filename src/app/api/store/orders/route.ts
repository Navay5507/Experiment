import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET: List all orders for products belonging to the authenticated seller user
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

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
         *,
         products (
            name,
            cover_image_url
         )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (e) {
    console.error('[Store Orders API] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
