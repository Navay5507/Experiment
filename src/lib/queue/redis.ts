import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';

if (!redisUrl) {
  console.warn('REDIS_URL is missing. Background jobs will not work.');
}

// Global cached connection to prevent dropping connections in dev
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
