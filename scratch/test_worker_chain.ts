import { commentQueue } from '../src/lib/queue/queues';
import { commentWorker, dmWorker } from '../src/lib/queue/worker';

console.log('Starting local worker chain test...');

commentWorker.on('completed', (job, result) => {
  console.log(`[commentWorker] ✅ Job ${job.id} completed. Result:`, result);
});

commentWorker.on('failed', (job, err) => {
  console.error(`[commentWorker] ❌ Job ${job?.id} failed:`, err);
});

dmWorker.on('completed', (job, result) => {
  console.log(`[dmWorker] ✅ Job ${job.id} completed. Result:`, result);
});

dmWorker.on('failed', (job, err) => {
  console.error(`[dmWorker] ❌ Job ${job?.id} failed:`, err);
});

async function run() {
  // Add a test job to commentQueue
  console.log('Queueing test comment job...');
  try {
    const job = await commentQueue.add('reply', {
      userId: '939638d2-0f7c-49ff-9cab-ec1c6ed75ea6',
      automationId: '7bdf8513-bfda-48dd-a388-a80fd41940a4',
      commentId: '18395260603082120', // Comment "Refer" from navaynarang05
      recipientId: '1667321891377355',
      commenterUsername: 'navaynarang05',
    }, {
      // Small delay for testing
      delay: 1000,
    });
    console.log('Test job queued with ID:', job.id);
  } catch (err: any) {
    console.error('Queue error:', err);
  }

  // Keep process alive for 30s to let workers run
  setTimeout(() => {
    console.log('Test complete. Closing workers...');
    commentWorker.close();
    dmWorker.close();
    process.exit(0);
  }, 35000);
}

run();
