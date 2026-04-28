const crypto = require('crypto');
const WEBHOOK_URL = 'https://autodrop.in/api/webhooks/instagram';
const APP_SECRET = '2333ad4d2f43c1a57dd9b5914cea993a';
const IG_USER_ID = '24510367881993936';
const NUM_REQUESTS = 50;

async function runLoadTest() {
  console.log(`Starting load test with ${NUM_REQUESTS} requests...`);
  const startTime = Date.now();
  let successes = 0;
  let failures = 0;

  const promises = [];

  for (let i = 0; i < NUM_REQUESTS; i++) {
    const payload = JSON.stringify({
      object: 'instagram',
      entry: [
        {
          id: IG_USER_ID,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: `loadtest_comment_${Date.now()}_${i}`,
                text: 'link please',
                from: {
                  id: `tester_user_${i}`,
                  username: `tester_${i}`
                },
                media: {
                  id: '123456789'
                }
              }
            }
          ]
        }
      ]
    });

    const signature = `sha256=${crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex')}`;

    promises.push(
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': signature
        },
        body: payload
      }).then(res => {
        if (res.ok) successes++;
        else failures++;
      }).catch(e => {
        failures++;
      })
    );
  }

  await Promise.all(promises);
  const endTime = Date.now();
  console.log(`\n=== LOAD TEST REPORT ===`);
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Concurrency: ${NUM_REQUESTS} simultaneous`);
  console.log(`Success (200 OK): ${successes}`);
  console.log(`Failed: ${failures}`);
  console.log(`Time Taken: ${endTime - startTime}ms`);
  console.log(`Throughput: ${Math.round((successes / (endTime - startTime)) * 1000)} req/sec`);
}

runLoadTest();
