/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0 && !key.trim().startsWith('#')) {
    process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis(process.env.REDIS_URL!);
const dmQueue = new Queue('autodrop-queue', { connection: redis });

async function run() {
  const userId = '08e5c91f-deb9-46f1-a95e-29e6ae4122d1';
  console.log('Fetching missed DMs for user:', userId);

  // Fetch all private_reply events from the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_type', 'dm_delivered')
    .gte('created_at', twentyFourHoursAgo);

  if (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }

  const missedRecipients = events?.filter(e => e.metadata?.type === 'private_reply') || [];
  
  console.log(`Found ${missedRecipients.length} private_reply events in the last 24 hours.`);

  // Deduplicate by recipient_id and automation_id just in case
  const uniqueDeliveries = new Map<string, any>();
  for (const event of missedRecipients) {
    const key = `${event.metadata.recipient_id}-${event.metadata.automation_id}`;
    if (!uniqueDeliveries.has(key)) {
      uniqueDeliveries.set(key, event);
    }
  }

  console.log(`Unique recipients to deliver links to: ${uniqueDeliveries.size}`);

  let count = 0;
  for (const event of uniqueDeliveries.values()) {
    const recipientId = event.metadata.recipient_id;
    const automationId = event.metadata.automation_id;

    if (!recipientId || !automationId) continue;

    console.log(`Queueing button-response for ${recipientId} on automation ${automationId}`);
    
    // Simulating that the user tapped the "GET_LINK" button or replied "yes"
    await dmQueue.add('button-response', {
      userId,
      automationId,
      recipientId,
      quickReplyPayload: 'GET_LINK',
    }, {
      delay: count * 1000, // Stagger them 1 second apart to avoid rate limits
    });
    
    count++;
  }

  console.log(`Queued ${count} jobs. They will be processed by the worker now!`);
  process.exit(0);
}

run().catch(console.error);
