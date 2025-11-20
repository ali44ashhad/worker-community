import express from "express";
import {
    becomeProvider,
    becomeProviderWithServices,
    updateProviderProfile,
    addServiceOffering,
    updateServiceOffering,
    deleteServiceOffering,
    getAllProviders,
    getTopProvidersByServiceClicks,
    getProviderById,
    getMyProviderProfile,
    getProviderDashboardStats,
    incrementProviderProfileCount
} from "../controllers/providerProfile.controller.js";
import { protect, isProvider } from "../middlewares/user.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// --- Public Routes ---
router.get("/top-providers", getTopProvidersByServiceClicks);
router.get("/", getAllProviders);

// Public route to increment provider profile click count (must be before /:id)
router.post("/:id/increment-count", incrementProviderProfileCount);

// --- Private Provider Routes (must come before /:id to avoid conflicts) ---
// Get current user's profile
router.get("/my-profile", protect, isProvider, getMyProviderProfile);

// Get provider dashboard stats
router.get("/dashboard/stats", protect, isProvider, getProviderDashboardStats);

// Update provider profile
router.put("/", protect, isProvider, updateProviderProfile);

// Create provider profile
router.post("/become-provider", protect, becomeProvider);

router.post("/become-provider-multi", protect, upload.any(), becomeProviderWithServices);

// --- Routes for Managing Services ---
router.post("/service", protect, isProvider, upload.array("portfolioImages", 10), addServiceOffering);

router.put("/service/:serviceId", protect, isProvider, upload.array("portfolioImages", 10), updateServiceOffering);

router.delete("/service/:serviceId", protect, isProvider, deleteServiceOffering);

// --- Get provider by ID (must be last to not catch other routes) ---
router.get("/:id", getProviderById);

export default router;
