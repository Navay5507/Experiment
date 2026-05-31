import { Queue } from 'bullmq';
import { createRedisConnection } from './redis';

// Queue-only module: safe to import from API routes without triggering Worker boot.
// Workers are defined separately in worker.ts and imported by the webhook route.

export const dmQueue = new Queue('autodrop-queue', { 
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

export const commentQueue = new Queue('comment-reply', { 
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});
