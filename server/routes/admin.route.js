import express from "express";
import { 
    getAdminDashboardStats, 
    getAllProviders,
    updateProviderDetails,
    updateProviderUserDetails,
    getAllServices,
    updateServiceDetails,
    deleteServiceImage
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
    upload.array("portfolioImages", 10),
    updateServiceDetails
);

router.delete(
    "/service/:serviceId/image",
    protect,
    isAdmin,
    deleteServiceImage
);

export default router;