import { redis } from './redis';

/**
 * Checks if a comment has already been processed using Redis.
 * If not processed, marks it as processed with a 24-hour expiration.
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
    // Expire the key after 24 hours (86400 seconds)
    // This prevents memory leak in Redis over time, 
    // and 24 hours is more than enough to prevent duplicate webhooks/polls
    await redis.expire(key, 86400);
    return false; // Not processed previously
  }
  
  return true; // Was already processed
}
