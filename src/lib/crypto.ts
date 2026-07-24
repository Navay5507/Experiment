import crypto from 'crypto';

/**
 * AES-256-GCM Encryption/Decryption for sensitive tokens (e.g. Instagram OAuth tokens).
 * 
 * Format: iv:authTag:ciphertext (all hex-encoded, colon-separated)
 * 
 * Requires ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. Cannot encrypt/decrypt tokens.');
  }
  const keyBuf = Buffer.from(key, 'hex');
  if (keyBuf.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Got ${keyBuf.length * 2} hex chars.`);
  }
  return keyBuf;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext (hex encoded).
 */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an encrypted string (format: iv:authTag:ciphertext) back to plaintext.
 * Returns the original string.
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Safely decrypt a token. If the token is not in encrypted format (legacy plain text),
 * returns it as-is. This allows a gradual migration from plain text to encrypted tokens.
 */
export function safeDecrypt(token: string | null | undefined): string | null {
  if (!token) return null;

  // Encrypted tokens always contain two colons (iv:authTag:ciphertext)
  // and are hex-encoded. Plain text Instagram tokens never contain colons.
  if (token.includes(':') && token.split(':').length === 3) {
    try {
      return decrypt(token);
    } catch (e) {
      // MED-4 FIX: Return null instead of ciphertext — callers handle null via existing guards
      console.error('[Crypto] ❌ Decryption failed — token requires re-encryption:', (e as Error).message);
      return null;
    }
  }

  // Plain text token (legacy, pre-encryption) — return as-is
  return token;
}
