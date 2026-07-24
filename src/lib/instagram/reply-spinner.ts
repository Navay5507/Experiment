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

  // Check if the user explicitly disabled the Anti-Ban Engine
  if (template.includes('__NO_SPIN__')) {
    return template.replace('__NO_SPIN__', '').trim();
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

  // Variation 7: Short & sweet
  variations.push(`${baseText} Sent! ⚡`);

  // Variation 8: Helpful tone
  variations.push(`Got you covered. ${baseText} 🎁`);

  // Variation 9: Confirmation
  variations.push(`It's in your inbox! ${baseText} 👀`);

  // Variation 10: Action-oriented
  variations.push(`Heading your way now. ${baseText} ✈️`);
  
  // Variation 11: Casual 'gotcha'
  variations.push(`Gotcha! ${baseText} Let me know what you think.`);

  // Variation 12: Super casual
  variations.push(`Done deal! ${baseText} 🤝`);

  // Variation 13: Prompt attention
  variations.push(`On it! ${baseText} Check your hidden requests just in case.`);

  // Variation 14: Friendly drop
  variations.push(`Dropped it in your DMs! ${baseText} 👇`);

  // Variation 15: Morning/Evening neutral
  variations.push(`Hope you're having a great day! ${baseText} ☀️`);

  // Variation 16: Hype
  variations.push(`You're going to love this! ${baseText} 🔥`);

  // Variation 17: Appreciative
  variations.push(`Thanks for reaching out! ${baseText} 🙏`);

  // Variation 18: Swift action
  variations.push(`Zooming into your DMs... ${baseText} 🏎️`);

  // Variation 19: Lighthearted
  variations.push(`Magic delivery successful! ${baseText} 🪄`);

  // Variation 20: Polished
  variations.push(`Successfully delivered. ${baseText} ✅`);

  // Variation 21: Direct & simple
  variations.push(`Check your inbox, ${baseText} 📩`);

  // Variation 22: Polite
  variations.push(`Please check your messages! ${baseText} 😊`);

  // Variation 23: Reassurance
  variations.push(`Sent it straight to you. ${baseText} 🎯`);

  // Variation 24: Engagement hook
  variations.push(`Just sent! ${baseText} Reply back there if you have questions!`);

  // Variation 25: Simple pointer
  variations.push(`Right here: ${baseText} 👉`);

  // Variation 26: Playful
  variations.push(`Slid into your DMs! ${baseText} 🏄‍♂️`);

  // Variation 27: Smooth
  variations.push(`Delivered! ${baseText} 📦`);

  // Variation 28: Welcoming
  variations.push(`Glad you asked! ${baseText} 🌟`);

  // Variation 29: Crisp
  variations.push(`In your DMs now. ${baseText} 💯`);

  // Variation 30: Wrap up
  variations.push(`That's on its way! ${baseText} ✉️`);

  // Variation 31: Confirmation check
  variations.push(`Check your hidden messages if you don't see it! ${baseText} 🕵️‍♂️`);

  // Variation 32: Speed
  variations.push(`Just fired that over! ${baseText} 🏃‍♂️`);

  // Variation 33: Polite confirmation
  variations.push(`It has been sent. ${baseText} 👍`);

  // Variation 34: Excited
  variations.push(`So excited for you to see this! ${baseText} 🤩`);

  // Variation 35: Reassurance 2
  variations.push(`Don't worry, it's in your inbox! ${baseText} 📥`);

  // Variation 36: Quick tip
  variations.push(`Check your message requests just in case. ${baseText} 💡`);

  // Variation 37: High energy
  variations.push(`Boom! ${baseText} 💥`);

  // Variation 38: Friendly signoff
  variations.push(`${baseText} Have an amazing day! 🌈`);

  // Variation 39: Action point
  variations.push(`Head over to your DMs! ${baseText} 🏃‍♀️`);

  // Variation 40: Formal
  variations.push(`Your request has been fulfilled. ${baseText} 📋`);

  // Variation 41: Short confirm
  variations.push(`${baseText} Confirmed! ✔️`);

  // Variation 42: Fun
  variations.push(`Ta-da! ${baseText} 🎉`);

  // Variation 43: Helpful nudge
  variations.push(`Just a heads up, it's in your DMs! ${baseText} 🔔`);

  // Variation 44: Assured
  variations.push(`Safely delivered. ${baseText} 🛡️`);

  // Variation 45: Prompt
  variations.push(`Right away! ${baseText} ⏱️`);

  // Variation 46: Casual drop
  variations.push(`Dropped that for you. ${baseText} 💧`);

  // Variation 47: Smooth sailing
  variations.push(`All clear! ${baseText} ⛵`);

  // Variation 48: Appreciation
  variations.push(`Appreciate the comment! ${baseText} 💙`);

  // Variation 49: Direct hit
  variations.push(`Target locked & sent. ${baseText} 🏹`);

  // Variation 50: Sweet
  variations.push(`Here you go, friend! ${baseText} 🍭`);

  // Variation 51: Fast track
  variations.push(`Fast-tracked to your inbox! ${baseText} 🚄`);

  // Variation 52: Verification
  variations.push(`Verified and sent. ${baseText} 💯`);

  // Variation 53: Stealth
  variations.push(`Sneaking this into your DMs... ${baseText} 🥷`);

  // Variation 54: Gentle
  variations.push(`Just placed it in your messages. ${baseText} 🕊️`);

  // Variation 55: Bold
  variations.push(`Look in your DMs NOW! ${baseText} ⚡`);

  // Variation 56: Check-in
  variations.push(`Did you get it? ${baseText} ❓`);

  // Variation 57: Warm
  variations.push(`Sending warm wishes and... ${baseText} ☕`);

  // Variation 58: Magic
  variations.push(`Poof! It's in your DMs. ${baseText} 🎩`);

  // Variation 59: Direct route
  variations.push(`Sent directly to you. ${baseText} 🛣️`);

  // Variation 60: Final bow
  variations.push(`Enjoy! ${baseText} 🥳`);

  return variations;
}
