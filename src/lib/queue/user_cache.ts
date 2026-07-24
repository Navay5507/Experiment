import { redis } from './redis';

const CACHE_TTL_SECONDS = 86400; // 24 hours

export interface CachedUser {
  id: string;
  instagramUserId: string;
  instagramAccessToken: string;
  plan: string;
  primaryInstagramUserId: string | null;
}

/**
 * Get the Autodrop user associated with a given Instagram Account ID
 * @param igId Instagram Account ID (Business ID or App-Scoped ID)
 */
export async function getUserFromIGCache(igId: string): Promise<CachedUser | null> {
  if (!igId) return null;
  try {
    const key = `ig_user_map:${igId}`;
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as CachedUser;
    }
  } catch (error) {
    console.error(`[UserCache] Failed to get user for IG ID ${igId}:`, error);
  }
  return null;
}

/**
 * Cache the Autodrop user associated with a given Instagram Account ID
 * @param igId Instagram Account ID (Business ID or App-Scoped ID)
 * @param user The user object to cache
 */
export async function setUserIGCache(igId: string, user: CachedUser): Promise<void> {
  if (!igId || !user) return;
  try {
    const key = `ig_user_map:${igId}`;
    await redis.set(key, JSON.stringify(user), 'EX', CACHE_TTL_SECONDS);
  } catch (error) {
    console.error(`[UserCache] Failed to set user for IG ID ${igId}:`, error);
  }
}
