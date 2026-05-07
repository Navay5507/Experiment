import crypto from "crypto";

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", INSTAGRAM_APP_SECRET)
    .update(rawBody)
    .digest("hex");

  const providedSignature = signature.replace("sha256=", "");
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(providedSignature, "hex")
  );
}

export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }
  return null;
}
