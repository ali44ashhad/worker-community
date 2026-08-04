import express from "express";
import { protect } from "../middlewares/user.middleware.js";
import {
  listActiveBusinessCategories,
  listCommunityLocalBusinesses,
  getCommunityLocalBusiness,
} from "../controllers/localBusiness.controller.js";

const router = express.Router();

router.get("/categories", protect, listActiveBusinessCategories);
router.get("/community", protect, listCommunityLocalBusinesses);
router.get("/community/:businessId", protect, getCommunityLocalBusiness);

export default router;
