const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID!;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const REDIRECT_URI = `${APP_URL}/api/instagram/callback`;

const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";
const INSTAGRAM_API_BASE = "https://graph.instagram.com";

export function getInstagramAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: "instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_messaging",
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const res = await fetch(`${META_GRAPH_BASE}/oauth/access_token`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", INSTAGRAM_APP_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("client_secret", INSTAGRAM_APP_SECRET);
  url.searchParams.set("code", code);

  const tokenRes = await fetch(url.toString());
  const json = (await tokenRes.json()) as TokenResponse & { error?: { message: string } };
  if (json.error) throw new Error(`OAuth error: ${json.error.message}`);
  return json;
}

interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function getLongLivedToken(shortLivedToken: string): Promise<LongLivedTokenResponse> {
  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", INSTAGRAM_APP_ID);
  url.searchParams.set("client_secret", INSTAGRAM_APP_SECRET);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as LongLivedTokenResponse & { error?: { message: string } };
  if (json.error) throw new Error(`Token exchange error: ${json.error.message}`);
  return json;
}

interface InstagramAccountInfo {
  instagramId: string;
  username: string;
  accessToken: string;
  tokenExpiresAt: Date;
}

export async function getInstagramBusinessAccount(
  accessToken: string
): Promise<InstagramAccountInfo> {
  // Get pages the user manages
  const pagesUrl = new URL(`${META_GRAPH_BASE}/me/accounts`);
  pagesUrl.searchParams.set("access_token", accessToken);

  const pagesRes = await fetch(pagesUrl.toString());
  const pagesJson = (await pagesRes.json()) as {
    data?: Array<{ id: string; access_token: string }>;
    error?: { message: string };
  };
  if (pagesJson.error) throw new Error(`Pages API error: ${pagesJson.error.message}`);

  const pages = pagesJson.data ?? [];
  if (pages.length === 0) throw new Error("No Facebook Pages found. Please connect a Facebook Page with an Instagram Business account.");

  const page = pages[0];

  // Get Instagram Business Account connected to the page
  const igUrl = new URL(`${META_GRAPH_BASE}/${page.id}`);
  igUrl.searchParams.set("fields", "instagram_business_account");
  igUrl.searchParams.set("access_token", accessToken);

  const igRes = await fetch(igUrl.toString());
  const igJson = (await igRes.json()) as {
    instagram_business_account?: { id: string };
    error?: { message: string };
  };
  if (igJson.error) throw new Error(`IG account error: ${igJson.error.message}`);
  if (!igJson.instagram_business_account) {
    throw new Error("No Instagram Business account linked to this Facebook Page.");
  }

  const igId = igJson.instagram_business_account.id;

  // Get IG username
  const profileUrl = new URL(`${INSTAGRAM_API_BASE}/${igId}`);
  profileUrl.searchParams.set("fields", "id,username");
  profileUrl.searchParams.set("access_token", accessToken);

  const profileRes = await fetch(profileUrl.toString());
  const profileJson = (await profileRes.json()) as {
    id: string;
    username: string;
    error?: { message: string };
  };
  if (profileJson.error) throw new Error(`Profile error: ${profileJson.error.message}`);

  // Get long-lived token
  const longLived = await getLongLivedToken(accessToken);

  return {
    instagramId: igId,
    username: profileJson.username,
    accessToken: longLived.access_token,
    tokenExpiresAt: new Date(Date.now() + longLived.expires_in * 1000),
  };
}
