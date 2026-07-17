/**
 * Normalize text for client-side search.
 * iOS often types curly apostrophes (') while stored names may use straight ones (').
 */
const APOSTROPHE_LIKE = /[''`´′ʻ]/g;

export const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(APOSTROPHE_LIKE, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const textIncludesSearch = (haystack, query) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return normalizeSearchText(haystack).includes(normalizedQuery);
};
