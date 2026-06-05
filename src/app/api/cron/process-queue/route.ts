import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[Cron] 🔄 Starting queue processor cycle...');
  
  // Keep the serverless function alive for 45 seconds to give BullMQ 
  // time to pick up delayed jobs and process them.
  // This is essential for jobs delayed up to 1 hour on Vercel Serverless.
  await new Promise(resolve => setTimeout(resolve, 45000));
  
  console.log('[Cron] ✅ Queue processor cycle complete.');
  return NextResponse.json({ ok: true, message: 'Queue processor kept alive for 45s' });
}
