import { commentQueue, dmQueue } from '../src/lib/queue/queues';

async function clearQueues() {
  console.log('Clearing commentQueue...');
  await commentQueue.obliterate({ force: true });
  console.log('Clearing dmQueue...');
  await dmQueue.obliterate({ force: true });
  console.log('Queues completely cleared.');
  process.exit(0);
}

clearQueues().catch(console.error);
