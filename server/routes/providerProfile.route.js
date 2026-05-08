import express from "express";
import {
    becomeProvider,
    becomeProviderWithServices,
    becomeProviderWithServicesJson,
    updateProviderProfile,
    addServiceOffering,
    updateServiceOffering,
    deleteServiceOffering,
    getAllProviders,
    getTopProvidersByServiceClicks,
    getProviderById,
    getMyProviderProfile,
    getProviderDashboardStats,
    incrementProviderProfileCount,
    getCloudinarySignature
} from "../controllers/providerProfile.controller.js";
import { protect, isProvider } from "../middlewares/user.middleware.js";
import upload, { uploadAny } from "../middlewares/multer.js";

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

// Signed upload helper for direct-to-Cloudinary uploads (avoids Vercel 413 limits)
router.get("/cloudinary-signature", protect, getCloudinarySignature);

// JSON-only become-provider flow (assets already uploaded to Cloudinary)
router.post("/become-provider-multi-json", protect, becomeProviderWithServicesJson);

// --- Routes for Managing Services ---
router.post("/service", protect, isProvider, uploadAny, addServiceOffering);

router.put("/service/:serviceId", protect, isProvider, uploadAny, updateServiceOffering);

router.delete("/service/:serviceId", protect, isProvider, deleteServiceOffering);

// --- Get provider by ID (must be last to not catch other routes) ---
router.get("/:id", getProviderById);

export default router;
