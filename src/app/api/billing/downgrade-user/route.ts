import { NextResponse } from 'next/server';
import { downgradeUserToFree } from '@/lib/billing/downgrade';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // In a real production scenario, you would use a secure cron secret or verify the Razorpay webhook signature.
    // For now, we use a simple bearer token matching the Supabase service key or a custom cron secret.
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
    }

    const result = await downgradeUserToFree(userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: `Successfully downgraded user ${userId} and enforced limits.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
