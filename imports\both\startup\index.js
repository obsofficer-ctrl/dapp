// Both client and server startup
// Import shared configurations here

export const SUPPORTED_LANGUAGES = ['de', 'en', 'fr', 'it'];
export const DEFAULT_LANGUAGE = 'de';

/**
 * Validates a language code against supported languages.
 * Returns the language if valid, otherwise returns the default.
 *
 * @param {string} language - The language code to validate
 * @returns {string} A valid language code
 */
export const validateLanguage = (language) => {
  if (!language) return DEFAULT_LANGUAGE;
  const normalized = language.toLowerCase().trim();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
};
