import express from "express";
import { protect } from "../middlewares/user.middleware.js";
import { getPublicKey, subscribe, unsubscribe, getStatus } from "../controllers/push.controller.js";

const router = express.Router();

router.get("/vapid-public-key", getPublicKey);
router.get("/status", protect, getStatus);
router.post("/subscribe", protect, subscribe);
router.delete("/unsubscribe", protect, unsubscribe);

export default router;
