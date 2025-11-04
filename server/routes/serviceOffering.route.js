import express from "express";
import { incrementServiceOfferingCount } from "../controllers/providerProfile.controller.js";

const router = express.Router();

// Public route to increment service offering click count
router.post("/:id/increment-count", incrementServiceOfferingCount);

export default router;

