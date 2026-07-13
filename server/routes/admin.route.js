import express from "express";
import { 
    getAdminDashboardStats, 
    getAllProviders,
    updateProviderDetails,
    updateProviderUserDetails,
    getAllServices,
    updateServiceDetails,
    deleteServiceImage,
    setServiceCoverImage,
    deleteServicePDF,
    getCategoryClicks,
    getProviderClicks,
    getAllUsers,
    updateUserStatus,
    getUserByIdAdmin,
    updateUserCommunityAdmin,
    getAllCategoriesAdmin,
    createCategoryAdmin,
    updateCategoryAdmin,
    updateCategoryStatusAdmin,
    getSecretaries,
    updateSecretaryDetails,
    createSecretary
} from "../controllers/admin.controller.js";
import {
    listAllAdmin,
    createCommunity,
    toggleCommunity,
    deleteCommunity,
} from "../controllers/adminInterestCommunity.controller.js";
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
    "/all-users",
    protect,
    isAdmin,
    getAllUsers
);

router.patch(
    "/user-status/:userId",
    protect,
    isAdmin,
    updateUserStatus
);

router.get(
    "/users/:userId",
    protect,
    isAdmin,
    getUserByIdAdmin
);

router.patch(
    "/users/:userId/community",
    protect,
    isAdmin,
    updateUserCommunityAdmin
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

router.patch(
    "/service/:serviceId/cover-image",
    protect,
    isAdmin,
    setServiceCoverImage
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

router.get(
    "/secretaries",
    protect,
    isAdmin,
    getSecretaries
);

router.post(
    "/secretaries",
    protect,
    isAdmin,
    createSecretary
);

router.patch(
    "/secretaries/:userId",
    protect,
    isAdmin,
    updateSecretaryDetails
);

// ========================== CATEGORY MANAGEMENT (Admin) ==========================
router.get(
    "/categories",
    protect,
    isAdmin,
    getAllCategoriesAdmin
);

router.post(
    "/categories",
    protect,
    isAdmin,
    createCategoryAdmin
);

router.put(
    "/categories/:categoryId",
    protect,
    isAdmin,
    updateCategoryAdmin
);

router.patch(
    "/categories/:categoryId/status",
    protect,
    isAdmin,
    updateCategoryStatusAdmin
);

router.get("/interest-communities", protect, isAdmin, listAllAdmin);
router.post("/interest-communities", protect, isAdmin, createCommunity);
router.patch("/interest-communities/:id/toggle", protect, isAdmin, toggleCommunity);
router.delete("/interest-communities/:id", protect, isAdmin, deleteCommunity);

export default router;