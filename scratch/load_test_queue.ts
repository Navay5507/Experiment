import { commentQueue } from '../src/lib/queue/queues';

async function runLoadTest() {
  const NUM_COMMENTS = 50; // Inject 50 comments at once
  console.log(`🚀 Starting Load Test: Injecting ${NUM_COMMENTS} concurrent comments into the queue...`);

  const jobs = [];

  for (let i = 1; i <= NUM_COMMENTS; i++) {
    // Generate a fake comment ID to bypass Redis deduplication
    const fakeCommentId = `test_comment_${Date.now()}_${i}`;
    
    // We use a real user/automation ID from your database so the worker can look them up,
    // but the recipient/comment IDs are fake so Meta will safely reject the API call 
    // without actually spamming any real accounts.
    jobs.push({
      name: 'reply',
      data: {
        userId: '939638d2-0f7c-49ff-9cab-ec1c6ed75ea6', // Your user ID
        automationId: '7bdf8513-bfda-48dd-a388-a80fd41940a4', // A valid automation ID
        commentId: fakeCommentId,
        recipientId: `fake_recipient_${i}`,
        commenterUsername: `load_tester_${i}`,
      },
      opts: {
        delay: Math.floor(Math.random() * 2000), // Slight random delay between 0-2s to simulate real traffic burst
      }
    });
  }

  // Inject all 50 jobs into Redis instantly
  await commentQueue.addBulk(jobs);
  
  console.log(`✅ Successfully injected ${NUM_COMMENTS} jobs into Upstash Redis!`);
  console.log(`👀 Now go look at your Render Logs! You will see the worker process all 50 concurrently.`);
  console.log(`(Note: The worker will throw Meta API errors because the comment IDs are fake, but the system won't crash!)`);
  
  process.exit(0);
}

runLoadTest().catch(console.error);
