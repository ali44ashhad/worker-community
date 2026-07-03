import express from "express";
import { incrementServiceOfferingCount } from "../controllers/providerProfile.controller.js";
import { getPublicServices, getCommunityServices, getTopServicesByClicks, getServiceOfferingById } from "../controllers/serviceOffering.controller.js";
import { protect } from "../middlewares/user.middleware.js";

const router = express.Router();

// Public paginated services list
router.get("/", getPublicServices);

// Community-scoped services for panel users
router.get("/community", protect, getCommunityServices);

// Public top services by clicks
router.get("/top-clicked", getTopServicesByClicks);

// Public route to fetch a single service offering
router.get("/:id", getServiceOfferingById);

// Public route to increment service offering click count
router.post("/:id/increment-count", incrementServiceOfferingCount);

export default router;

