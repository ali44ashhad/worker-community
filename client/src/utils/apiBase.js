export function getSocketUrl() {
  const raw = (import.meta.env.VITE_SOCKET_URL || "").trim();
  if (raw) {
    return raw.replace(/\/+$/, "");
  }
  // Same host as REST API (works when API + Socket.IO run together on AWS/EC2).
  // For split deploy (API on Vercel, socket elsewhere), set VITE_SOCKET_URL.
  return getApiBase() || "http://localhost:3000";
}

export function getApiBase() {
  // In production (Vercel), an empty value keeps requests relative so `vercel.json` rewrites work.
  // In local dev with no env, the API runs on port 3000.
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
    if (import.meta.env.DEV) {
      return "http://localhost:3000";
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

