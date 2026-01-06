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
import cors from "cors";
import "dotenv/config"

const app = express();

app.use(cookieParser()); 

// 1. Allow CORS for ALL routes and ALL methods:
app.use(cors({
  origin: [
    'https://worker-community.vercel.app',
    'https://www.commun.in',
    'https://commun.in',
    'http://localhost:5173', // for local dev
    'http://localhost:3000'  // for local dev
  ],
  credentials: true,
}));

// 2. Explicitly handle preflight OPTIONS for ALL paths:
app.options(/^.*$/, cors({ origin: true, credentials: true })); // [2]

// Increase payload limits for JSON and urlencoded bodies
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ✅ API routes
app.use('/api/user', userRouter);
app.use('/api/provider-profile', providerProfileRouter);
app.use('/api/service-offering', serviceOfferingRouter);
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

// ✅ Connect to database
dbConnect();

const serverInstance = app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`);
});

// Catch unhandled promise rejections / uncaught exceptions so the server keeps running
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
