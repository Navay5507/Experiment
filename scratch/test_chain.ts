import { dmQueue } from '../src/lib/queue/queues';

async function run() {
  console.log('Testing dmQueue.add directly...');
  try {
    const job = await dmQueue.add('send', {
      userId: '939638d2-0f7c-49ff-9cab-ec1c6ed75ea6',
      automationId: '119d9960-fb6a-45c9-8b85-7dab26be168e',
      recipientId: '1667321891377355',
      commenterUsername: 'navaynarang05',
      commentId: '18395260603082120',
      skipDedup: true,
    }, {
      delay: 5000,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 10000,
      }
    });
    console.log('✅ Success! Job added with ID:', job.id);
  } catch (err: any) {
    console.error('❌ Failed:', err.message, err);
  }
  process.exit(0);
}

run();
