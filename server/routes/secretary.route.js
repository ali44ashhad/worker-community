import express from "express";
import { protect, isSecretary } from "../middlewares/user.middleware.js";
import { eventAttachmentUpload } from "../middlewares/eventAttachmentUpload.js";
import {
    listPendingRegistrations,
    approveRegistration,
    rejectRegistration,
    listCommunityMembers,
    getCommunityMemberById,
    updateMemberStatus,
    getFeatureToggles,
    updateFeatureToggle,
    listCommunityEvents,
    createCommunityEvent,
    deleteCommunityEvent,
    listBroadcasts,
    createBroadcast,
    deleteBroadcast,
    getCategoryToggles,
    updateCategoryToggle,
} from "../controllers/secretary.controller.js";

const router = express.Router();

router.get("/registrations/pending", protect, isSecretary, listPendingRegistrations);
router.get("/members", protect, isSecretary, listCommunityMembers);
router.get("/members/:userId", protect, isSecretary, getCommunityMemberById);
router.patch("/members/:userId/status", protect, isSecretary, updateMemberStatus);
router.patch("/registrations/:userId/approve", protect, isSecretary, approveRegistration);
router.patch("/registrations/:userId/reject", protect, isSecretary, rejectRegistration);
router.get("/features/toggles", protect, isSecretary, getFeatureToggles);
router.patch("/features/toggles", protect, isSecretary, updateFeatureToggle);
router.get("/services/toggles", protect, isSecretary, getCategoryToggles);
router.patch("/services/toggles", protect, isSecretary, updateCategoryToggle);
router.get("/events", protect, isSecretary, listCommunityEvents);
router.post("/events", protect, isSecretary, eventAttachmentUpload, createCommunityEvent);
router.delete("/events/:eventId", protect, isSecretary, deleteCommunityEvent);
router.get("/broadcasts", protect, isSecretary, listBroadcasts);
router.post("/broadcasts", protect, isSecretary, createBroadcast);
router.delete("/broadcasts/:broadcastId", protect, isSecretary, deleteBroadcast);

export default router;
