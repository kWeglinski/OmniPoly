import { lookupWord } from "../../server/words.js";

/**
 * Filters a LanguageTool API response.
 *
 * - Preserves all top‑level fields of the original result.
 * - For each match:
 *   • If the rule category is "TYPOS" and dictionary filtering is enabled, remove the match when the word exists in the custom dictionary.
 *   • Otherwise keep the match unchanged.
 *
 * @param {object} result The raw response from LanguageTool.
 * @param {boolean} enableDictionaryFilter Whether to enable dictionary-based filtering (default: true).
 * @returns {object} A new object with the same top‑level properties and a filtered `matches` array.
 */
export const filterResult = (result, enableDictionaryFilter = true) => {
  // Log for debugging purposes
  console.log("[FILTER] total matches received:", result.matches?.length ?? 0);

  // Clone the entire result to keep all other fields intact
  const filtered = { ...result };

  // Safely process the `matches` array if it exists
  filtered.matches = (result.matches || [])
    .map((match) => {
      // If dictionary filtering is enabled and this is a typo rule, check the custom dictionary
      if (enableDictionaryFilter && match.rule?.category?.id === "TYPOS") {
        // Validate context exists before extracting text
        if (!match.context || !match.context.text) {
          return match;
        }
        const exists = lookupWord(
          match.context.text.substr(match.context.offset, match.context.length)
        );
        // Remove the match when the word is present in the dictionary
        return exists ? false : match;
      }
      // Keep all other matches unchanged (or when dictionary filtering is disabled)
      return match;
    })
    .filter((elem) => elem); // Drop any `false` entries

  console.log("[FILTER] matches after dictionary filter:", filtered.matches?.length ?? 0);
  return filtered;
};