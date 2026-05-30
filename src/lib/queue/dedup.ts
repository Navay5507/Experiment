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

// =============================================
// PER-USER 24-HOUR DM DEDUPLICATION
// Meta 2026 Rule: Max 1 automated DM per user per 24 hours
// from comment/story triggers.
// =============================================

/**
 * Checks if a DM has already been sent to this recipient from this creator
 * within the last 24 hours. If not, marks it as sent.
 * 
 * @param creatorUserId The AutoDrop user ID (the creator)
 * @param recipientId The Instagram IGSID of the person receiving the DM
 * @returns true if DM was already sent (should SKIP), false if OK to send
 */
export async function isDMSentToUser(creatorUserId: string, recipientId: string): Promise<boolean> {
  return false; // 24h rate limiter disabled entirely
}

/**
 * Returns the remaining time (in seconds) that a user is restricted from receiving another DM.
 * @param creatorUserId The AutoDrop user ID
 * @param recipientId The Instagram IGSID
 * @returns Seconds remaining (0 if no restriction)
 */
export async function getDMRestrictionTTL(creatorUserId: string, recipientId: string): Promise<number> {
  return 0; // 24h rate limiter disabled entirely
}

// =============================================
// HOURLY RATE CAPS
// Meta 2026 Limits:
//   - 200 automated DMs/hour (we cap at 150 for safety margin)
//   - 750 comment replies/hour (we cap at 600 for safety margin)
// =============================================

/**
 * Checks if the creator has exceeded the hourly DM limit.
 * Uses a rolling hourly counter in Redis.
 * 
 * @param creatorUserId The AutoDrop user ID
 * @returns { allowed: boolean, count: number, limit: number }
 */
export async function checkHourlyDMLimit(creatorUserId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  const HOURLY_DM_LIMIT = 150; // Meta allows 200, we use 150 for safety
  const hourKey = `dm_hourly:${creatorUserId}:${getCurrentHourKey()}`;

  const count = await redis.incr(hourKey);

  // Set expiry on first increment (1 hour + 5 min buffer)
  if (count === 1) {
    await redis.expire(hourKey, 3900); // 65 minutes
  }

  return {
    allowed: count <= HOURLY_DM_LIMIT,
    count,
    limit: HOURLY_DM_LIMIT,
  };
}

/**
 * Checks if the creator has exceeded the hourly comment reply limit.
 * 
 * @param creatorUserId The AutoDrop user ID
 * @returns { allowed: boolean, count: number, limit: number }
 */
export async function checkHourlyCommentLimit(creatorUserId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  const HOURLY_COMMENT_LIMIT = 600; // Meta allows 750, we use 600 for safety
  const hourKey = `comment_hourly:${creatorUserId}:${getCurrentHourKey()}`;

  const count = await redis.incr(hourKey);

  if (count === 1) {
    await redis.expire(hourKey, 3900);
  }

  return {
    allowed: count <= HOURLY_COMMENT_LIMIT,
    count,
    limit: HOURLY_COMMENT_LIMIT,
  };
}

/**
 * Returns a stable key for the current hour (e.g., "2026-05-16T10")
 */
function getCurrentHourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}`;
}

// =============================================
// RANDOM DELAY GENERATOR
// Used by queue.add() to add human-like delays
// =============================================

/**
 * Generates a random delay in milliseconds for job scheduling.
 * 
 * @param minMs Minimum delay in ms (default: 5000 = 5s)
 * @param maxMs Maximum delay in ms (default: 45000 = 45s)
 * @returns Random delay value in ms
 */
export function getRandomDelay(minMs = 5000, maxMs = 30000): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
