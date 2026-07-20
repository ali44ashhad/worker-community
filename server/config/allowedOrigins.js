/** Browser origins allowed for CORS and Socket.io (keep in sync). */
export const ALLOWED_ORIGINS = new Set([
  "https://worker-community.vercel.app",
  "https://www.commun.in",
  "https://commun.in",
  "http://localhost:5173",
  "http://localhost:3000",
]);

export const ALLOWED_ORIGINS_LIST = [...ALLOWED_ORIGINS];
