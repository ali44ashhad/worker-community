import express from "express";
import { 
    getAdminDashboardStats, 
    getAllProviders,
    updateProviderDetails,
    updateProviderUserDetails,
    getAllServices,
    updateServiceDetails,
    deleteServiceImage,
    deleteServicePDF,
    getCategoryClicks,
    getProviderClicks
} from "../controllers/admin.controller.js";
import { protect, isAdmin } from "../middlewares/user.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get(
    "/dashboard-stats",
    protect,
    isAdmin, 
    getAdminDashboardStats
);

router.get(
    "/all-providers",
    protect,
    isAdmin,
    getAllProviders
);

router.put(
    "/update-provider/:providerId",
    protect,
    isAdmin,
    updateProviderDetails
);

router.put(
    "/update-provider-user/:providerId",
    protect,
    isAdmin,
    updateProviderUserDetails
);

router.get(
    "/all-services",
    protect,
    isAdmin,
    getAllServices
);

router.put(
    "/update-service/:serviceId",
    protect,
    isAdmin,
    upload.any(),
    updateServiceDetails
);

router.delete(
    "/service/:serviceId/image",
    protect,
    isAdmin,
    deleteServiceImage
);

router.delete(
    "/service/:serviceId/pdf",
    protect,
    isAdmin,
    deleteServicePDF
);

router.get(
    "/category-clicks",
    protect,
    isAdmin,
    getCategoryClicks
);

router.get(
    "/provider-clicks",
    protect,
    isAdmin,
    getProviderClicks
);

export default router;