import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dbConnect from "./config/database.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import providerProfileRouter from "./routes/providerProfile.route.js";
import bookingRouter from "./routes/booking.route.js";
import commentRouter from "./routes/comment.routes.js";
import adminRouter from "./routes/admin.route.js";
import secretaryRouter from "./routes/secretary.route.js";
import serviceOfferingRouter from "./routes/serviceOffering.route.js";
import sitemapRouter from "./routes/sitemap.route.js";
import categoryRouter from "./routes/category.route.js";
import interestCommunityRouter from "./routes/interestCommunity.route.js";
import { initChatSocket } from "./socket/chatSocket.js";
import cors from "cors";
import { seedCategoriesIfMissing } from "./utils/seedCategories.js";

const app = express();

// Attach a request id to every request for easier debugging
app.use((req, res, next) => {
  const rid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

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

// Increase payload limits for JSON and urlencoded bodies
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API routes
app.use('/api/user', userRouter);
app.use('/api/provider-profile', providerProfileRouter);
app.use('/api/service-offering', serviceOfferingRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/comments', commentRouter);
app.use('/api/admin',adminRouter)
app.use('/api/secretary', secretaryRouter);
app.use('/api/interest-communities', interestCommunityRouter);
app.use('/api', sitemapRouter);

// Global error handler to prevent crashes on unexpected errors
app.use((err, req, res, next) => {
  const rid = req?.requestId;
  console.error(`[${rid || "no-rid"}] Unhandled error:`, err);
  if (res.headersSent) {
    return next(err);
  }

  // Never return confusing technical errors to end-users
  const status = err.status || 500;
  const message =
    status === 413
      ? "Upload too large. Please keep each file under 50MB."
      : status === 401
        ? "Please login again and retry."
        : status === 403
          ? "You are not allowed to do this."
          : "Something went wrong. Please try again.";

  res.status(status).json({ success: false, message, requestId: rid });
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
      const httpServer = http.createServer(app);
      const io = new Server(httpServer, {
        cors: {
          origin: [...allowedOrigins],
          credentials: true,
        },
      });
      initChatSocket(io);

      httpServer.listen(port, () => {
        console.log(`Server is listening at port: ${port}`);
        console.log(`Socket.io chat enabled`);
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
