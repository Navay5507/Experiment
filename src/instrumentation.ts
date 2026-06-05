export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Autodrop] 🚀 Workers booted: autodrop-queue + comment-reply');
  }
}
