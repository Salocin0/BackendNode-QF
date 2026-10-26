// Input hygiene for the "Foody" chatbot. Dependency-free so it can be unit-tested
// without a DB or an OpenAI key.

// Long enough for a detailed question, short enough to keep prompts (and cost) bounded.
export const MAX_CHAT_INPUT_LENGTH = 500;

/**
 * Collapses whitespace, strips control characters and caps the length.
 * Returns '' for anything that is not a non-empty string.
 */
export const normalizeChatInput = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CHAT_INPUT_LENGTH);
};
