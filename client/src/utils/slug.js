export function slugifyCategoryName(name) {
  const raw = String(name || "").trim().toLowerCase();
  if (!raw) return "";

  // Keep "&" (user wants: fitness-&-sports). Remove other special chars.
  const cleaned = raw
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9&-]/g, "");

  return cleaned.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

