import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

async function run() {
  const dmQueue = new Queue('autodrop-queue', { connection });
  const commentQueue = new Queue('comment-reply', { connection });

  console.log('\n=== comment-reply Queue (Latest 15 Jobs) ===');
  const commentJobs = await commentQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  // Sort by ID descending
  commentJobs.sort((a, b) => Number(b.id) - Number(a.id));
  
  for (const job of commentJobs.slice(0, 15)) {
    const state = await job.getState();
    console.log(`Job ID: ${job.id} | Name: ${job.name} | State: ${state} | Attempts: ${job.attemptsMade}`);
    console.log(`  Data:`, JSON.stringify(job.data));
    if (job.failedReason) console.log(`  Failed Reason: ${job.failedReason}`);
  }

  console.log('\n=== autodrop-queue Queue (Latest 15 Jobs) ===');
  const dmJobs = await dmQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  // Sort by ID descending
  dmJobs.sort((a, b) => Number(b.id) - Number(a.id));
  
  for (const job of dmJobs.slice(0, 15)) {
    const state = await job.getState();
    console.log(`Job ID: ${job.id} | Name: ${job.name} | State: ${state} | Attempts: ${job.attemptsMade}`);
    console.log(`  Data:`, JSON.stringify(job.data));
    if (job.failedReason) console.log(`  Failed Reason: ${job.failedReason}`);
  }

  connection.disconnect();
}

run();
