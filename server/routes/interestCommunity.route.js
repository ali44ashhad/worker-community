import express from "express";
import { protect } from "../middlewares/user.middleware.js";
import {
    listActiveForMember,
    joinCommunity,
    leaveCommunity,
    getMembers,
    getMessages,
} from "../controllers/interestCommunity.controller.js";

const router = express.Router();

router.get("/", protect, listActiveForMember);
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);
router.get("/:id/members", protect, getMembers);
router.get("/:id/messages", protect, getMessages);

export default router;
