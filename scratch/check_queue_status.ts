import { commentQueue, dmQueue } from '../src/lib/queue/queues';

async function checkQueues() {
  const cWaiting = await commentQueue.getWaitingCount();
  const cActive = await commentQueue.getActiveCount();
  const cDelayed = await commentQueue.getDelayedCount();
  const cFailed = await commentQueue.getFailedCount();

  const dWaiting = await dmQueue.getWaitingCount();
  const dActive = await dmQueue.getActiveCount();
  const dDelayed = await dmQueue.getDelayedCount();
  const dFailed = await dmQueue.getFailedCount();

  console.log('=== Comment Queue ===');
  console.log(`Waiting: ${cWaiting}, Active: ${cActive}, Delayed: ${cDelayed}, Failed: ${cFailed}`);
  
  console.log('=== DM Queue ===');
  console.log(`Waiting: ${dWaiting}, Active: ${dActive}, Delayed: ${dDelayed}, Failed: ${dFailed}`);

  // Fetch a few failed jobs if any
  if (cFailed > 0) {
    console.log('\nRecent Failed Comment Jobs:');
    const failed = await commentQueue.getFailed(0, 2);
    failed.forEach(j => console.log(`Job ${j.id}: ${j.failedReason}`));
  }
  
  process.exit(0);
}

checkQueues().catch(console.error);
