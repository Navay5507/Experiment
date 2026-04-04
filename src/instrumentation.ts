export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to boot BullMQ workers on the Node.js runtime only
    const { dmWorker, commentWorker } = await import('@/lib/queue/worker');

    dmWorker.on('ready', () => console.log('[Autodrop] ✅ DM Worker ready'));
    commentWorker.on('ready', () => console.log('[Autodrop] ✅ Comment Worker ready'));
    dmWorker.on('failed', (job, err) => console.error(`[Worker DM FAIL] Job ${job?.id}: ${err.message}`));
    commentWorker.on('failed', (job, err) => console.error(`[Worker Comment FAIL] Job ${job?.id}: ${err.message}`));
    dmWorker.on('completed', (job) => console.log(`[Worker DM] ✅ Completed: ${job.name} | ${job.id}`));
    commentWorker.on('completed', (job) => console.log(`[Worker Comment] ✅ Completed: ${job.name} | ${job.id}`));

    console.log('[Autodrop] 🚀 Workers booted: autodrop-queue + comment-reply');
  }
}
