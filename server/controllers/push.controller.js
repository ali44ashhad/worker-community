import PushSubscription from "../models/pushSubscription.model.js";
import { getVapidPublicKey, isWebPushConfigured } from "../utils/webPush.js";

/**
 * @route GET /api/push/vapid-public-key
 */
export const getPublicKey = async (req, res) => {
    try {
        if (!isWebPushConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Push notifications are not configured on the server.",
            });
        }

        return res.status(200).json({
            success: true,
            data: { publicKey: getVapidPublicKey() },
        });
    } catch (error) {
        console.error("getPublicKey:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route POST /api/push/subscribe
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export const subscribe = async (req, res) => {
    try {
        const endpoint = String(req.body?.endpoint || "").trim();
        const p256dh = String(req.body?.keys?.p256dh || "").trim();
        const auth = String(req.body?.keys?.auth || "").trim();

        if (!endpoint || !p256dh || !auth) {
            return res.status(400).json({
                success: false,
                message: "Invalid push subscription payload.",
            });
        }

        const userAgent = String(req.headers["user-agent"] || "").slice(0, 500);

        await PushSubscription.findOneAndUpdate(
            { endpoint },
            {
                user: req.user._id,
                endpoint,
                keys: { p256dh, auth },
                userAgent,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Push notifications enabled.",
        });
    } catch (error) {
        console.error("subscribe:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route DELETE /api/push/unsubscribe
 * Body: { endpoint }
 */
export const unsubscribe = async (req, res) => {
    try {
        const endpoint = String(req.body?.endpoint || "").trim();
        if (!endpoint) {
            return res.status(400).json({ success: false, message: "Endpoint is required." });
        }

        await PushSubscription.deleteOne({ endpoint, user: req.user._id });

        return res.status(200).json({
            success: true,
            message: "Push notifications disabled.",
        });
    } catch (error) {
        console.error("unsubscribe:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/push/status
 */
export const getStatus = async (req, res) => {
    try {
        const count = await PushSubscription.countDocuments({ user: req.user._id });
        return res.status(200).json({
            success: true,
            data: {
                configured: isWebPushConfigured(),
                subscribed: count > 0,
                deviceCount: count,
            },
        });
    } catch (error) {
        console.error("getStatus:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
