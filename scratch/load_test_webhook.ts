import crypto from 'crypto';

const APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '';
const WEBHOOK_URL = 'https://autodrop-three.vercel.app/api/webhooks/instagram';
const INSTAGRAM_ACCOUNT_ID = '17841460395368551'; // A random IG ID for testing (replace if you want)

function generateSignature(payload: string): string {
  const hmac = crypto.createHmac('sha256', APP_SECRET);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

async function runWebhookLoadTest() {
  const NUM_REQUESTS = 500;
  console.log(`🚀 Firing ${NUM_REQUESTS} simulated webhooks at ${WEBHOOK_URL}...`);

  const requests = [];

  for (let i = 1; i <= NUM_REQUESTS; i++) {
    // Exact payload structure Meta sends for a comment
    const payloadObj = {
      object: 'instagram',
      entry: [
        {
          id: INSTAGRAM_ACCOUNT_ID,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: `fake_comment_${Date.now()}_${i}`,
                text: 'Refer', // Your keyword
                from: {
                  id: `commenter_id_${i}`,
                  username: `load_tester_${i}`
                },
                media: { id: 'fake_media_id' }
              }
            }
          ]
        }
      ]
    };

    const payloadStr = JSON.stringify(payloadObj);
    const signature = generateSignature(payloadStr);

    // Fire the HTTP request
    requests.push(
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': signature,
        },
        body: payloadStr
      })
    );
  }

  const startTime = Date.now();
  const responses = await Promise.all(requests);
  const endTime = Date.now();

  const statuses = responses.map(r => r.status);
  const successCount = statuses.filter(s => s === 200).length;
  const failCount = statuses.length - successCount;

  console.log(`\n✅ Finished sending ${NUM_REQUESTS} webhooks!`);
  console.log(`⏱️ Time taken: ${endTime - startTime} ms`);
  console.log(`🟢 Success (200 OK): ${successCount}`);
  console.log(`🔴 Failed/Rate Limited: ${failCount}`);
  console.log(`\nIf the fix worked, you should see 500 Successes and 0 Failures!`);
  
  process.exit(0);
}

runWebhookLoadTest().catch(console.error);
