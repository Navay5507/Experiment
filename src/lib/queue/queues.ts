import { Queue } from 'bullmq';
import { redis } from './redis';

// Queue-only module: safe to import from API routes without triggering Worker boot.
// Workers are defined separately in worker-boot.ts.

export const dmQueue = new Queue('autodrop-queue', { 
  connection: redis,
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
  connection: redis,
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
