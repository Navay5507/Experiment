import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0 && !key.trim().startsWith('#')) {
    let val = values.join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[key.trim()] = val;
  }
});

const r = new Redis(process.env.REDIS_URL!);
const cq = new Queue('comment-reply', { connection: r });
const dq = new Queue('autodrop-queue', { connection: r });

async function wipe() {
  console.log('Draining queues...');
  await cq.drain();
  await dq.drain();
  console.log('Cleared!');
  process.exit(0);
}
wipe();
