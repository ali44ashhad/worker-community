import { getUnreadCountsForUser, markInboxCategoryRead } from "../utils/inAppNotify.js";
import { INBOX_CATEGORIES } from "../models/inAppNotification.model.js";

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
