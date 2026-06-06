import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('Connecting to Redis:', redisUrl.split('@')[1] || redisUrl);

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

async function run() {
  const dmQueue = new Queue('autodrop-queue', { connection });
  const commentQueue = new Queue('comment-reply', { connection });

  console.log('\n--- Queue: comment-reply ---');
  const commentJobs = await commentQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  console.log(`Total jobs: ${commentJobs.length}`);
  for (const job of commentJobs.slice(0, 5)) {
    console.log(`  Job ID: ${job.id}, Name: ${job.name}, Status: ${await job.getState()}, Attempts: ${job.attemptsMade}`);
    if (job.failedReason) console.log(`    Failed Reason: ${job.failedReason}`);
  }

  console.log('\n--- Queue: autodrop-queue ---');
  const dmJobs = await dmQueue.getJobs(['waiting', 'active', 'delayed', 'completed', 'failed']);
  console.log(`Total jobs: ${dmJobs.length}`);
  for (const job of dmJobs.slice(0, 5)) {
    console.log(`  Job ID: ${job.id}, Name: ${job.name}, Status: ${await job.getState()}, Attempts: ${job.attemptsMade}`);
    if (job.failedReason) console.log(`    Failed Reason: ${job.failedReason}`);
    console.log(`    Data:`, JSON.stringify(job.data));
  }

  connection.disconnect();
}

run();
