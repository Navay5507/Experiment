const GRAPH_API_BASE = "https://graph.instagram.com";
const GRAPH_API_VERSION = "v21.0";
const META_GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface GraphAPIOptions {
  accessToken: string;
}

interface GraphAPIError {
  message: string;
  type: string;
  code: number;
}

interface GraphAPIResponse<T> {
  data?: T;
  error?: GraphAPIError;
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

// ============================================================
// Posts
// ============================================================

interface MediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
}

export async function getUserMedia(
  instagramUserId: string,
  options: GraphAPIOptions,
  limit = 25
): Promise<MediaItem[]> {
  const url = new URL(`${GRAPH_API_BASE}/${instagramUserId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", options.accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as GraphAPIResponse<MediaItem[]>;
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return json.data ?? [];
}

// ============================================================
// User Profile
// ============================================================

interface UserProfile {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
}

export async function getUserProfile(
  instagramUserId: string,
  options: GraphAPIOptions
): Promise<UserProfile> {
  const url = new URL(`${GRAPH_API_BASE}/${instagramUserId}`);
  url.searchParams.set("fields", "id,username,name,profile_picture_url,followers_count");
  url.searchParams.set("access_token", options.accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as UserProfile & { error?: GraphAPIError };
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return json;
}

// ============================================================
// Comments
// ============================================================

interface CommentData {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  from?: { id: string; username: string };
}

export async function getMediaComments(
  mediaId: string,
  options: GraphAPIOptions
): Promise<CommentData[]> {
  const url = new URL(`${GRAPH_API_BASE}/${mediaId}/comments`);
  url.searchParams.set("fields", "id,text,username,timestamp,from{id,username}");
  url.searchParams.set("access_token", options.accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as GraphAPIResponse<CommentData[]>;
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return json.data ?? [];
}

export async function replyToComment(
  commentId: string,
  message: string,
  options: GraphAPIOptions
): Promise<{ id: string }> {
  const url = new URL(`${GRAPH_API_BASE}/${commentId}/replies`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: options.accessToken,
    }),
  });

  const json = (await res.json()) as { id: string; error?: GraphAPIError };
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return { id: json.id };
}

// ============================================================
// Direct Messages
// ============================================================

export async function sendDirectMessage(
  instagramScopedUserId: string,
  recipientId: string,
  message: string,
  options: GraphAPIOptions
): Promise<{ message_id: string }> {
  const url = new URL(`${META_GRAPH_BASE}/${instagramScopedUserId}/messages`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message },
      access_token: options.accessToken,
    }),
  });

  const json = (await res.json()) as { message_id?: string; error?: GraphAPIError };
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return { message_id: json.message_id ?? "" };
}

// ============================================================
// Follow Status Check
// ============================================================

export async function checkFollowerStatus(
  instagramUserId: string,
  followerId: string,
  options: GraphAPIOptions
): Promise<boolean> {
  const url = new URL(`${GRAPH_API_BASE}/${instagramUserId}/followers`);
  url.searchParams.set("access_token", options.accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as GraphAPIResponse<Array<{ id: string }>>;
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);

  const followers = json.data ?? [];
  return followers.some((f) => f.id === followerId);
}

// ============================================================
// Token Refresh
// ============================================================

export async function refreshLongLivedToken(
  accessToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const url = new URL(`${GRAPH_API_BASE}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: GraphAPIError;
  };
  if (json.error) throw new Error(`Graph API error: ${json.error.message}`);
  return {
    access_token: json.access_token ?? "",
    expires_in: json.expires_in ?? 0,
  };
}
