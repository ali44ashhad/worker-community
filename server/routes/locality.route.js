import express from "express";
import { listLocalitiesPublic } from "../controllers/locality.controller.js";

const router = express.Router();

router.get("/", listLocalitiesPublic);

export default router;
