import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || '';

if (!redisUrl) {
  console.warn('REDIS_URL is missing. Background jobs will not work.');
}

// Global cached connection to prevent dropping connections in dev
const globalForRedis = global as unknown as { redis: Redis };

const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  keepAlive: 240000, // 4 mins (Upstash drops at 5 mins). Saves massive amounts of cmds.
  family: 0,
};

// Standard shared connection for non-blocking commands (Queue.add, etc.)
export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, redisOptions);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// BullMQ Workers MUST have their own dedicated connection because they use 
// blocking commands (BLPOP) which will freeze a shared connection.
export const createRedisConnection = () => new Redis(redisUrl, redisOptions);
