import express from "express";
import { incrementServiceOfferingCount } from "../controllers/providerProfile.controller.js";
import { getPublicServices, getTopServicesByClicks } from "../controllers/serviceOffering.controller.js";

const router = express.Router();

// Public paginated services list
router.get("/", getPublicServices);

// Public top services by clicks
router.get("/top-clicked", getTopServicesByClicks);

// Public route to increment service offering click count
router.post("/:id/increment-count", incrementServiceOfferingCount);

export default router;

