/** Commun handle: 2–40 chars, lowercase alphanumeric with hyphens/underscores between edges. */
export const COMMUN_NAME_REGEX = /^[a-z0-9]([a-z0-9_-]{0,38}[a-z0-9])?$/;

export function normalizeCommunNameInput(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

export function isValidCommunName(cn) {
  if (!cn || cn.length < 2 || cn.length > 40) return false;
  return COMMUN_NAME_REGEX.test(cn);
}
