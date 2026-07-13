import express from "express";
import { protect } from "../middlewares/user.middleware.js";
import { getCommunityVendors } from "../controllers/vendor.controller.js";

const router = express.Router();

router.get("/community", protect, getCommunityVendors);

export default router;

