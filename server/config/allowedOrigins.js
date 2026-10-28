/** Browser origins allowed for CORS and Socket.io (keep in sync). */
const PRODUCTION_ORIGINS = [
  "https://worker-community.vercel.app",
  "https://www.commun.in",
  "https://commun.in",
];

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://localhost:3000",
];

export const ALLOWED_ORIGINS = new Set(
  process.env.NODE_ENV === "production"
    ? PRODUCTION_ORIGINS
    : [...PRODUCTION_ORIGINS, ...DEV_ORIGINS]
);

export const ALLOWED_ORIGINS_LIST = [...ALLOWED_ORIGINS];
