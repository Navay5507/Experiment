import { redis } from './redis';

/**
 * READ-ONLY check — does NOT claim the key.
 * Call this first to see if a comment was already processed.
 *
 * @param commentId The Instagram comment ID
 * @returns true if already processed, false if not yet seen
 */
export async function hasCommentBeenProcessed(commentId: string): Promise<boolean> {
  if (!commentId) return false;
  const key = `processed_comment:${commentId}`;
  const exists = await redis.exists(key);
  return exists === 1;
}

/**
 * Atomically claims the dedup key for a comment.
 * Call this ONLY after the job has been successfully enqueued.
 * Returns false if it was already claimed (e.g. concurrent delivery).
 *
 * @param commentId The Instagram comment ID
 * @returns true if successfully claimed (safe to process), false if already claimed
 */
export async function markCommentProcessed(commentId: string): Promise<boolean> {
  if (!commentId) return false;
  const key = `processed_comment:${commentId}`;
  // Atomic check-and-set with 7-day expiration (604800 seconds)
  const result = await redis.set(key, '1', 'EX', 604800, 'NX');
  return result === 'OK'; // true = we claimed it, false = already existed
}

/**
 * @deprecated Use hasCommentBeenProcessed + markCommentProcessed instead.
 * Kept for backwards compatibility with the cron poller.
 */
export async function isCommentProcessed(commentId: string): Promise<boolean> {
  if (!commentId) return false;
  const key = `processed_comment:${commentId}`;
  const result = await redis.set(key, '1', 'EX', 604800, 'NX');
  if (result === 'OK') {
    return false; // Not processed previously, successfully claimed
  }
  return true; // Was already processed
}

// =============================================
// PER-USER 24-HOUR COMMENTER COOLDOWN
// Enforces that a specific person can only trigger a comment automation once every 24 hours.
// =============================================

/**
 * Calculates the necessary delay for a commenter to strictly enforce 1 interaction (job) per 24 hours.
 * Uses an atomic rolling queue:
 * - If no lock exists, returns 0 (execute immediately) and sets a 24h lock.
 * - If a lock exists, it calculates the delay until the lock expires, and extends the lock by ANOTHER 24 hours
 *   so that any subsequent comments are queued sequentially, day by day.
 * 
 * @param creatorUserId The AutoDrop user ID (the creator)
 * @param commenterId The Instagram ID of the commenter
 * @returns The delay in milliseconds before the job should execute
 */
export async function getCommenterDelayMs(creatorUserId: string, commenterId: string): Promise<number> {
  if (!commenterId) return 0;
  
  const key = `commenter_cooldown:${creatorUserId}:${commenterId}`;
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 86400000;
  
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local cooldown = tonumber(ARGV[2])
    
    local currentEnd = tonumber(redis.call('get', key) or "0")
    
    if currentEnd < now then
      -- Lock has expired or never existed. Job runs now.
      local newEnd = now + cooldown
      redis.call('set', key, newEnd, 'PX', cooldown)
      return 0
    else
      -- Lock is active. Job must wait until currentEnd.
      -- Then, IT grants a NEW 24h lock, pushing the end time further!
      local newEnd = currentEnd + cooldown
      redis.call('set', key, newEnd, 'PX', newEnd - now)
      return currentEnd - now
    end
  `;
  
  try {
    const delayMs = await redis.eval(script, 1, key, now, TWENTY_FOUR_HOURS_MS) as number;
    return delayMs;
  } catch (err) {
    console.error(`[Dedup] Failed to calculate commenter delay, returning 0:`, err);
    return 0;
  }
}

// =============================================
// PER-USER 24-HOUR DM DEDUPLICATION
// Meta 2026 Rule: Max 1 automated DM per user per 24 hours
// from comment/story triggers.
// =============================================

/**
 * Checks if a DM has already been sent to this recipient for this specific automation.
 * If mediaId is provided, it applies a lifetime lock PER REEL (only 1 DM per person per reel).
 * If mediaId is not provided, it applies a 24-hour lock per automation.
 * 
 * @param creatorUserId The AutoDrop user ID (the creator)
 * @param recipientId The Instagram IGSID of the person receiving the DM
 * @param automationId The ID of the automation
 * @param mediaId (Optional) The ID of the Instagram reel/post
 * @returns true if DM was already sent and should be skipped, false if OK to send
 */
export async function isDMSentToUser(creatorUserId: string, recipientId: string, automationId: string, mediaId?: string): Promise<boolean> {
  let key: string;
  let result: string | null;

  if (mediaId) {
    // If mediaId is provided, we lock this specific automation for this specific media FOREVER.
    // This prevents a user from ever getting a DM twice for the same reel via the same automation.
    key = `dm_sent:${creatorUserId}:${recipientId}:${automationId}:${mediaId}`;
    result = await redis.set(key, '1', 'NX'); // No expiration
  } else {
    // General trigger (e.g. dm keyword without a specific post). 24h cooldown.
    key = `dm_sent:${creatorUserId}:${recipientId}:${automationId}`;
    result = await redis.set(key, '1', 'EX', 86400, 'NX');
  }

  if (result === 'OK') {
    return false; // Not sent yet
  }
  return true; // Already sent — skip
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
export async function checkHourlyDMLimit(creatorUserId: string, peek = false): Promise<{ allowed: boolean; count: number; limit: number }> {
  const HOURLY_DM_LIMIT = 150; // Meta allows 200, we use 150 for safety
  const hourKey = `dm_hourly:${creatorUserId}:${getCurrentHourKey()}`;

  // CRIT-3 FIX: Check before incrementing to avoid phantom counts on blocked requests
  const current = await redis.get(hourKey);
  const currentNum = current ? Number(current) : 0;
  
  if (currentNum >= HOURLY_DM_LIMIT) {
    return { allowed: false, count: currentNum, limit: HOURLY_DM_LIMIT };
  }

  // If we are just peeking, return the current state without incrementing
  if (peek) {
    return { allowed: true, count: currentNum, limit: HOURLY_DM_LIMIT };
  }

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

  // CRIT-3 FIX: Check before incrementing to avoid phantom counts on blocked requests
  const current = await redis.get(hourKey);
  if (current && Number(current) >= HOURLY_COMMENT_LIMIT) {
    return { allowed: false, count: Number(current), limit: HOURLY_COMMENT_LIMIT };
  }

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
 * @param maxMs Maximum delay in ms (default: 300000 = 5m)
 * @returns Random delay value in ms
 */
export function getRandomDelay(minMs = 5000, maxMs = 300000): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// =============================================
// SPACED DELAY GENERATOR (Anti-Burst)
// =============================================

/**
 * Generates an atomically spaced delay for a user to prevent API bursts.
 * If multiple jobs are triggered simultaneously, it forces them to be
 * spaced out by at least spacingMs.
 * 
 * @param userId The user ID
 * @param type The type of action ('comment' or 'dm')
 * @param spacingMs Minimum spacing in ms between executions
 * @returns The calculated delay in ms from NOW
 */
export async function getSpacedDelay(userId: string, type: 'comment' | 'dm', spacingMs = 5000): Promise<number> {
  const key = `next_exec:${type}:${userId}`;
  const now = Date.now();
  
  // Lua script ensures atomic read-and-update of the next execution time.
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local spacing = tonumber(ARGV[2])
    
    local current = tonumber(redis.call('get', key) or "0")
    local baseTime = current
    if now > current then
      baseTime = now
    end
    
    local nextTime = baseTime + spacing
    redis.call('set', key, nextTime, 'PX', 300000)
    return nextTime - now
  `;
  
  try {
    const extraDelay = await redis.eval(script, 1, key, now, spacingMs) as number;
    // Add a small jitter to the spaced delay so they don't look purely robotic
    const jitter = Math.floor(Math.random() * 2000); 
    return extraDelay + jitter;
  } catch (err) {
    console.error(`[Dedup] Failed to calculate spaced delay, falling back to random:`, err);
    return getRandomDelay(spacingMs, spacingMs * 3);
  }
}
