import express from "express";
import {
    becomeProviderWithServices,
    updateProviderProfile,
    addServiceOffering,
    updateServiceOffering,
    deleteServiceOffering,
    addServiceOfferingJson,
    updateServiceOfferingJson,
    getAllProviders,
    getTopProvidersByServiceClicks,
    getProviderById,
    getMyProviderProfile,
    getProviderDashboardStats,
    incrementProviderProfileCount,
    getS3PresignedUpload
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

router.post("/become-provider-multi", protect, upload.any(), becomeProviderWithServices);

router.post("/s3-presign", protect, getS3PresignedUpload);

// --- Routes for Managing Services ---
router.post("/service", protect, isProvider, uploadAny, addServiceOffering);

router.put("/service/:serviceId", protect, isProvider, uploadAny, updateServiceOffering);

router.delete("/service/:serviceId", protect, isProvider, deleteServiceOffering);

// JSON-only service create/update (assets already uploaded to S3)
router.post("/service-json", protect, isProvider, addServiceOfferingJson);
router.put("/service-json/:serviceId", protect, isProvider, updateServiceOfferingJson);

// --- Get provider by ID (must be last to not catch other routes) ---
router.get("/:id", getProviderById);

export default router;
