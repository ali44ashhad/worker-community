import express from "express";
import dbConnect from "./config/database.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import providerProfileRouter from "./routes/providerProfile.route.js";
import bookingRouter from "./routes/booking.route.js";
import commentRouter from "./routes/comment.routes.js";
import adminRouter from "./routes/admin.route.js";
import cors from "cors";
import "dotenv/config"

const app = express();

// 1. Allow CORS for ALL routes and ALL methods:
app.use(cors({
  origin: true,
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
app.use('/api/bookings', bookingRouter);
app.use('/api/comments', commentRouter);
app.use('/api/admin',adminRouter)

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is live");
});

// ✅ Connect to database
dbConnect();

app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`);
});
