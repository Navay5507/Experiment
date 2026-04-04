import { NextResponse } from "next/server";
import { redis } from "@/lib/queue/redis";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
     const start = Date.now();
     await redis.ping();
     const latency = Date.now() - start;

     // Attempt to read the core BullMQ waiting queue directly from Upstash
     const pendingLength = await redis.llen('bull:autodrop-queue:wait').catch(() => 0);
     const activeLength = await redis.llen('bull:autodrop-queue:active').catch(() => 0);
     
     return NextResponse.json({
        pending: (pendingLength || 0) + (activeLength || 0),
        latency,
        status: "operational"
     });
  } catch (err) {
     return NextResponse.json({ 
        pending: 0, 
        latency: 0, 
        status: "degraded", 
        error: String(err) 
     });
  }
}
