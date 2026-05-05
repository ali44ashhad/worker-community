import express from "express";
import { getActiveCategories } from "../controllers/category.controller.js";

const router = express.Router();

// Public endpoint for active categories
router.get("/", getActiveCategories);

export default router;

