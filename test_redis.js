const Redis = require('ioredis');
const redis = new Redis('"rediss://default:gQAAAAAAAU2uAAIncDI3ZDY0Yjc0OTBhNGY0ZGVmYWU5YWZlYzQ0Zjg0N2Y1ZnAyODU0MjI@mint-chigger-85422.upstash.io:6379"');
async function run() {
  console.log('Keys:', await redis.keys('*autodrop*'));
  process.exit(0);
}
run();
