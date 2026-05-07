import { Redis } from "@upstash/redis";
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Upstash Redis client for general caching/rate limiting
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// IORedis connection for BullMQ (requires raw Redis protocol)
function getRedisConnection(): IORedis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  // Parse Upstash URL to get connection details for ioredis
  // For local dev, use standard Redis connection
  if (url.includes("upstash.io")) {
    return new IORedis(url, {
      maxRetriesPerRequest: null,
      tls: { rejectUnauthorized: false },
    });
  }
  return new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
  });
}

let redisConnection: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redisConnection) {
    redisConnection = getRedisConnection();
  }
  return redisConnection;
}

// BullMQ Queues
export const commentReplyQueue = new Queue("comment-reply", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export const dmSendQueue = new Queue("dm-send", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export const retriggerQueue = new Queue("retrigger", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});
