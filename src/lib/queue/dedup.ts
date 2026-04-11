import { redis } from './redis';

/**
 * Checks if a comment has already been processed using Redis.
 * If not processed, marks it as processed with a 7-day expiration.
 *
 * @param commentId The Instagram comment ID
 * @returns boolean true if already processed, false if newly marked as processed
 */
export async function isCommentProcessed(commentId: string): Promise<boolean> {
  if (!commentId) return false;
  
  const key = `processed_comment:${commentId}`;
  
  // setnx (SET if Not eXists) returns 1 if key was set, 0 if it already existed
  const isNew = await redis.setnx(key, '1');
  
  if (isNew) {
    // Expire the key after 7 days (604800 seconds)
    // This matches Instagram's Private Reply window (7 days) and ensures
    // comments are never re-processed within the relevant timeframe.
    // Previous 24h TTL was causing next-day re-triggering via the cron poller.
    await redis.expire(key, 604800);
    return false; // Not processed previously
  }
  
  return true; // Was already processed
}
