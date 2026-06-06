import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    for (let line of envFile.split('\n')) {
      line = line.replace('\r', '').trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split('=');
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
} catch (e) {
  console.error('Failed to load .env.local:', e);
}


import { commentWorker, dmWorker } from '../src/lib/queue/worker';


console.log('Starting workers locally for testing...');

commentWorker.on('completed', (job, result) => {
  console.log(`[commentWorker] Job ${job.id} completed. Result:`, result);
});

commentWorker.on('failed', (job, err) => {
  console.error(`[commentWorker] Job ${job?.id} failed:`, err);
});

dmWorker.on('completed', (job, result) => {
  console.log(`[dmWorker] Job ${job.id} completed. Result:`, result);
});

dmWorker.on('failed', (job, err) => {
  console.error(`[dmWorker] Job ${job?.id} failed:`, err);
});

console.log('Workers are active and listening to Redis. Waiting for jobs (40s)...');

setTimeout(() => {
  console.log('Shutting down test workers.');
  commentWorker.close();
  dmWorker.close();
  process.exit(0);
}, 40000);
