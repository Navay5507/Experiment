import * as http from 'http';
import '../src/lib/queue/worker'; // This imports and automatically starts the BullMQ workers

const PORT = process.env.PORT || 8080;

// Create a simple HTTP server to satisfy Render's health checks
// and to allow UptimeRobot to ping the worker to keep it awake.
const server = http.createServer((req, res) => {
  if (req.url === '/ping' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is running and awake!\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found\n');
  }
});

server.listen(PORT, () => {
  console.log(`[Worker Server] Listening for health checks on port ${PORT}`);
  console.log(`[Worker Server] BullMQ workers initialized and actively processing jobs...`);
});
