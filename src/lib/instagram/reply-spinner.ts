/**
 * Reply Spinner — Anti-Ban Engine
 * 
 * Generates varied versions of comment replies and DM texts
 * to prevent Meta's duplicate-text detection from flagging accounts.
 * 
 * Zero external dependencies. Zero API costs.
 */

// =============================================
// BUILT-IN VARIATION POOLS
// =============================================

const COMMENT_REPLY_VARIATIONS = [
  'Check your DM! 👀',
  'Sent it to your DMs! 🔥',
  'Just DM\'d you the link ✨',
  'It\'s in your DMs 📩',
  'Dropped it in your inbox! 🎯',
  'Headed to your DMs now! 🚀',
  'Sliding into your DMs 📬',
  'Check your messages! 💬',
];

const DM_GREETING_VARIATIONS = [
  'Thanks for your interest!',
  'Hey! Glad you reached out!',
  'Awesome, thanks for commenting!',
  'Great choice! Here you go:',
  'Hey there! Here\'s what you asked for:',
  'Thanks for the comment!',
  'Here you go! 🙌',
  'You got it!',
];

const EMOJI_POOL = ['👀', '🔥', '✨', '📩', '🎯', '🚀', '📬', '💬', '⚡', '🙌', '💥', '🎁'];

// =============================================
// CORE SPINNER FUNCTIONS
// =============================================

/**
 * Returns a random item from an array.
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Spins a comment reply template into a varied version.
 * 
 * If the user has a custom template, we make small variations of it
 * (emoji swap, minor text tweaks). If no custom template, we pick
 * from the built-in pool.
 * 
 * @param template The user's reply_template (or null/empty for defaults)
 * @returns A varied version of the reply text
 */
export function spinCommentReply(template?: string | null): string {
  // No custom template → pick from built-in pool
  if (!template || template.trim() === '') {
    return pickRandom(COMMENT_REPLY_VARIATIONS);
  }

  // Custom template → apply minor variations
  const variations = generateTemplateVariations(template);
  return pickRandom(variations);
}

/**
 * Exposes the internal variation engine to the frontend UI
 * so users can preview exactly how their text will be spun.
 */
export function getPreviewVariations(template?: string | null): string[] {
  if (!template || template.trim() === '') {
    return COMMENT_REPLY_VARIATIONS.slice(0, 5);
  }
  return generateTemplateVariations(template);
}

/**
 * Spins the initial DM greeting text.
 * 
 * @param template The user's initial_dm_text (or null for defaults)
 * @returns A varied greeting
 */
export function spinDMGreeting(template?: string | null): string {
  if (!template || template.trim() === '') {
    return pickRandom(DM_GREETING_VARIATIONS);
  }

  const variations = generateTemplateVariations(template);
  return pickRandom(variations);
}

/**
 * Takes a user's custom template and generates 5-8 natural variations.
 * 
 * Strategy:
 * 1. Keep the core message intact
 * 2. Swap emojis if present
 * 3. Add/remove trailing emojis
 * 4. Minor punctuation variations
 */
function generateTemplateVariations(template: string): string[] {
  const variations: string[] = [template]; // Original always included

  // Strip trailing emojis for base text
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const baseText = template.replace(emojiRegex, '').trim();

  // Variation: original text + different emoji
  variations.push(`${baseText} ${pickRandom(EMOJI_POOL)}`);
  variations.push(`${baseText} ${pickRandom(EMOJI_POOL)}`);

  // Variation: add exclamation or remove it
  if (baseText.endsWith('!')) {
    variations.push(baseText.slice(0, -1));
    variations.push(`${baseText.slice(0, -1)} ${pickRandom(EMOJI_POOL)}`);
  } else {
    variations.push(`${baseText}!`);
    variations.push(`${baseText}! ${pickRandom(EMOJI_POOL)}`);
  }

  // Variation: prepend a casual word
  const prefixes = ['Hey! ', 'Yo! ', '', ''];
  const prefix = pickRandom(prefixes);
  if (prefix) {
    variations.push(`${prefix}${baseText} ${pickRandom(EMOJI_POOL)}`);
  }

  return variations;
}
