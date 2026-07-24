import express from "express";
import { listActiveBanners } from "../controllers/banner.controller.js";

const router = express.Router();

// Public — for mobile app (active banners only)
router.get("/", listActiveBanners);

export default router;
