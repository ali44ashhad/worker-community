import express from "express";
import dbConnect from "./config/database.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import providerProfileRouter from "./routes/providerProfile.route.js";
import bookingRouter from "./routes/booking.route.js";
import commentRouter from "./routes/comment.routes.js";
import adminRouter from "./routes/admin.route.js";
import serviceOfferingRouter from "./routes/serviceOffering.route.js";
import sitemapRouter from "./routes/sitemap.route.js";
import categoryRouter from "./routes/category.route.js";
import cors from "cors";
import "dotenv/config"
import { seedCategoriesIfMissing } from "./utils/seedCategories.js";

const app = express();

// On serverless/CDN layers, 304 responses may be served without CORS headers.
// Disable automatic ETag generation so the browser always receives full CORS headers.
app.set("etag", false);

app.use(cookieParser()); 

// 1. Allow CORS for ALL routes and ALL methods:
const allowedOrigins = new Set([
  "https://worker-community.vercel.app",
  "https://www.commun.in",
  "https://commun.in",
  "http://localhost:5173",
  "http://localhost:3000",
]);

// Ensure CORS headers are present even on cached/early/error responses.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  next();
});

// Handle preflight early (Vercel/edge can be picky about 204 + headers)
app.options(/^.*$/, (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization"
  );
  return res.status(204).send();
});

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser clients (no origin) and allowed browser origins
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// (preflight handled above)

// Increase payload limits for JSON and urlencoded bodies
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ✅ API routes
app.use('/api/user', userRouter);
app.use('/api/provider-profile', providerProfileRouter);
app.use('/api/service-offering', serviceOfferingRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/comments', commentRouter);
app.use('/api/admin',adminRouter)
app.use('/api', sitemapRouter);

// Global error handler to prevent crashes on unexpected errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is live");
});

// ----------------------------
// Vercel serverless bootstrap
// ----------------------------
const isVercel = Boolean(process.env.VERCEL);
let initPromise = null;

async function init() {
  if (!initPromise) {
    initPromise = (async () => {
      await dbConnect();
      await seedCategoriesIfMissing();
    })();
  }
  return initPromise;
}

// Local/dev: start a long-running HTTP server.
if (!isVercel) {
  init()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is listening at port: ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

// Vercel: export a serverless handler (no app.listen).
export default async function handler(req, res) {
  await init();
  return app(req, res);
}

// Catch unhandled promise rejections / uncaught exceptions so the server keeps running
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
