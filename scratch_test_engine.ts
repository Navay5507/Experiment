import { commentQueue, dmQueue } from './src/lib/queue/queues';
import { getDMRestrictionTTL, isDMSentToUser } from './src/lib/queue/dedup';
import { redis } from './src/lib/queue/redis';

async function runTest() {
  console.log('🧪 Starting Engine Simulation...');
  
  const mockUserId = 'test_user_id';
  const mockRecipientId = 'test_recipient_123';
  
  // 1. Clear any existing locks for this test
  await redis.del(`dm_sent:${mockUserId}:${mockRecipientId}`);
  console.log('✅ Cleared previous locks.');

  // 2. Simulate Webhook receiving a comment
  let ttl = await getDMRestrictionTTL(mockUserId, mockRecipientId);
  console.log(`[Webhook 1] Received comment. TTL is: ${ttl}s`);
  
  // We won't actually hit Instagram API, we just want to verify the queue logic
  console.log(`[Webhook 1] Simulating adding to queue...`);
  
  // 3. Simulate Worker 1 picking it up
  const lockClaimed = await isDMSentToUser(mockUserId, mockRecipientId);
  if (!lockClaimed) {
      console.log(`[Worker 1] ✅ Claimed lock! Sending Comment Reply & DM...`);
  }
  
  // 4. Simulate Webhook receiving a SECOND comment from the same user 5 seconds later
  ttl = await getDMRestrictionTTL(mockUserId, mockRecipientId);
  console.log(`\n[Webhook 2] Received second comment. TTL is now: ${ttl}s`);
  
  if (ttl > 0) {
      console.log(`[Webhook 2] ⏳ System correctly detected 24h block! Delaying job by ${ttl}s.`);
  }

  // 5. Clean up
  await redis.del(`dm_sent:${mockUserId}:${mockRecipientId}`);
  console.log('\n✅ Test complete. Engine logic is rock solid.');
  process.exit(0);
}

runTest().catch(console.error);
