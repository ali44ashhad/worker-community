import express from "express";
import { protect } from "../middlewares/user.middleware.js";
import { listEmergencyContactsForCommunity } from "../controllers/emergencyContact.controller.js";

const router = express.Router();

router.get("/community", protect, listEmergencyContactsForCommunity);

export default router;

