export function getApiBase() {
  // In production (Vercel), prefer relative `/api/*` so `vercel.json` rewrites work.
  // In local dev, set VITE_API_URL=http://localhost:3001 (no trailing `/api`).
  const raw = (import.meta.env.VITE_API_URL || "").trim();
  if (!raw) {
    // If env isn't set, try to infer a sane default in production.
    // This avoids large multipart uploads failing through frontend proxies/rewrites.
    if (typeof window !== "undefined") {
      const host = String(window.location?.hostname || "").toLowerCase();
      if (host.endsWith("commun.in")) {
        return "https://api.commun.in";
      }
    }
    return "";
  }

  // Normalize:
  // - remove trailing `/`
  // - if someone set `.../api`, strip it to prevent `/api/api/*`
  let base = raw.replace(/\/+$/, "");
  base = base.replace(/\/api$/i, "");
  return base;
}

