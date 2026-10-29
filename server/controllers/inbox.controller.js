import mongoose from "mongoose";
import {
    getUnreadCountsForUser,
    listNotificationsForUser,
    markInboxCategoryRead,
    markNotificationRead,
} from "../utils/inAppNotify.js";
import { INBOX_CATEGORIES } from "../models/inAppNotification.model.js";

const parsePositiveInteger = (value, fallback, maximum) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

const LEGACY_NOTIFICATION_LABELS = {
    approvals: "Approval update",
    communities: "Community message",
    broadcast: "Community broadcast",
    events: "Community event",
    registration: "Registration update",
};

/**
 * @route GET /api/user/inbox
 * Query: { page?: number, limit?: number, category?: string }
 */
export const getInboxNotifications = async (req, res) => {
    try {
        const page = parsePositiveInteger(req.query.page, 1, 1_000_000);
        const limit = parsePositiveInteger(req.query.limit, 20, 100);
        const category = String(req.query.category || "").trim();

        if (category && !INBOX_CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid inbox category." });
        }

        const [{ notifications: storedNotifications, total }, counts] = await Promise.all([
            listNotificationsForUser(req.user._id, { page, limit, category }),
            getUnreadCountsForUser(req.user._id),
        ]);
        const notifications = storedNotifications.map((notification) => {
            const fallbackTitle = LEGACY_NOTIFICATION_LABELS[notification.category] || "CommuN notification";
            return {
                ...notification,
                title: notification.title || fallbackTitle,
                message: notification.message || `${fallbackTitle}.`,
                destination: notification.destination || "",
            };
        });
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCounts: counts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("getInboxNotifications:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/user/inbox/counts
 */
export const getInboxCounts = async (req, res) => {
    try {
        const counts = await getUnreadCountsForUser(req.user._id);
        return res.status(200).json({ success: true, data: { counts } });
    } catch (error) {
        console.error("getInboxCounts:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route PATCH /api/user/inbox/:notificationId/read
 */
export const markNotificationReadController = async (req, res) => {
    try {
        const { notificationId } = req.params;
        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({ success: false, message: "Invalid notification ID." });
        }

        const notification = await markNotificationRead(req.user._id, notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found.",
            });
        }

        const counts = await getUnreadCountsForUser(req.user._id);
        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            data: { notification, counts },
        });
    } catch (error) {
        console.error("markNotificationRead:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route POST /api/user/inbox/mark-read
 * Body: { category: string }
 */
export const markInboxRead = async (req, res) => {
    try {
        const category = String(req.body?.category || "").trim();
        if (!INBOX_CATEGORIES.includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid inbox category." });
        }

        await markInboxCategoryRead(req.user._id, category);
        const counts = await getUnreadCountsForUser(req.user._id);

        return res.status(200).json({
            success: true,
            message: "Marked as read.",
            data: { counts },
        });
    } catch (error) {
        console.error("markInboxRead:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
