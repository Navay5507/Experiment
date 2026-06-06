import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

async function run() {
  const commentQueue = new Queue('comment-reply', { connection });
  const dmQueue = new Queue('autodrop-queue', { connection });

  console.log('Searching for jobs in comment-reply queue...');
  const commentJobs = await commentQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  for (const job of commentJobs) {
    if (JSON.stringify(job.data).includes('18395260603082120') || JSON.stringify(job.data).includes('navaynarang05')) {
      const state = await job.getState();
      console.log(`[comment-reply] Job ID: ${job.id} | Name: ${job.name} | State: ${state}`);
      console.log(`  Data:`, JSON.stringify(job.data));
      if (job.failedReason) console.log(`  Failed Reason: ${job.failedReason}`);
    }
  }

  console.log('\nSearching for jobs in autodrop-queue queue...');
  const dmJobs = await dmQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  for (const job of dmJobs) {
    if (JSON.stringify(job.data).includes('18395260603082120') || JSON.stringify(job.data).includes('navaynarang05')) {
      const state = await job.getState();
      console.log(`[autodrop-queue] Job ID: ${job.id} | Name: ${job.name} | State: ${state}`);
      console.log(`  Data:`, JSON.stringify(job.data));
      if (job.failedReason) console.log(`  Failed Reason: ${job.failedReason}`);
    }
  }

  connection.disconnect();
}

run();
