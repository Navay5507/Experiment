import { NextResponse } from 'next/server';
import { downgradeUserToFree } from '@/lib/billing/downgrade';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[Cron] ❌ Unauthorized downgrade attempt');
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
