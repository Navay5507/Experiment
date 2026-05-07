import { test, mock } from 'node:test';
import assert from 'node:assert';
import { InstagramAPI } from './api';

test('InstagramAPI.sendDM sends application/json payload', async () => {
  const originalFetch = global.fetch;
  let fetchOptions: any = null;
  
  global.fetch = mock.fn(async (url, options) => {
    fetchOptions = options;
    return { json: async () => ({ success: true }) } as any;
  });

  await InstagramAPI.sendDM('1234', 'Hello', 'dummy-token');

  assert.strictEqual(fetchOptions.headers['Content-Type'], 'application/json');
  assert.ok(typeof fetchOptions.body === 'string');
  const body = JSON.parse(fetchOptions.body);
  assert.strictEqual(body.recipient.id, '1234');
  assert.strictEqual(body.message.text, 'Hello');

  global.fetch = originalFetch;
});

test('InstagramAPI.replyToComment sends application/x-www-form-urlencoded payload', async () => {
  const originalFetch = global.fetch;
  let fetchOptions: any = null;
  
  global.fetch = mock.fn(async (url, options) => {
    fetchOptions = options;
    return { json: async () => ({ success: true }) } as any;
  });

  await InstagramAPI.replyToComment('comment-5678', 'Reply Text', 'dummy-token');

  assert.strictEqual(fetchOptions.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.ok(fetchOptions.body.includes('message=Reply+Text') || fetchOptions.body.includes('message=Reply%20Text'));
  assert.ok(fetchOptions.body.includes('access_token=dummy-token'));

  global.fetch = originalFetch;
});
