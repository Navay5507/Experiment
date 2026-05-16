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
 * Takes a user's custom template and generates 5-8 natural, structurally different variations.
 * 
 * Strategy:
 * 1. Keep the core message intact
 * 2. Wrap the core message in completely different sentence structures
 * 3. Use varied emojis and conversational tones
 */
function generateTemplateVariations(template: string): string[] {
  const variations: string[] = [template]; // Original always included

  // Strip trailing emojis to get the raw core message
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  let baseText = template.replace(emojiRegex, '').trim();
  
  // Ensure baseText has some punctuation if it doesn't
  if (baseText && !baseText.match(/[.!?]$/)) {
    baseText += '.';
  }

  // Variation 1: Casual confirmation
  variations.push(`Just sent that over to you! ${baseText} ✨`);

  // Variation 2: Friendly greeting + fallback instruction
  variations.push(`Hey there! ${baseText} Check your message requests if you don't see it right away.`);

  // Variation 3: Enthusiastic + check
  variations.push(`Awesome! ${baseText} Let me know if you got it! 🙌`);

  // Variation 4: Direct delivery
  variations.push(`All done! ${baseText} 🚀`);

  // Variation 5: Alternate emoji + trailing thought
  variations.push(`${baseText} Hope you find it helpful! 💬`);

  // Variation 6: Quick ping
  variations.push(`Pinged you! ${baseText} 📬`);

  return variations;
}
