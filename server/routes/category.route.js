import express from "express";
import { getActiveCategories, getTopCategoriesByClicks } from "../controllers/category.controller.js";

const router = express.Router();

// Public endpoint for active categories
router.get("/", getActiveCategories);

// Public endpoint for top categories by clicks
router.get("/top-clicked", getTopCategoriesByClicks);

export default router;

