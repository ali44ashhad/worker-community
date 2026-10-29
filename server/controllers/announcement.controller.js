import Announcement from "../models/announcement.model.js";
import MobilePushDevice from "../models/mobilePushDevice.model.js";
import PushSubscription from "../models/pushSubscription.model.js";
import User from "../models/user.model.js";
import { createInAppNotifications } from "../utils/inAppNotify.js";
import { sendPushToUsers, isWebPushConfigured } from "../utils/webPush.js";
import { isMobilePushConfigured } from "../utils/mobilePush.js";

const DELIVERY_BATCH_SIZE = 250;

const parsePositiveInteger = (value, fallback, maximum) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, maximum);
};

export const listAnnouncements = async (req, res) => {
    try {
        const page = parsePositiveInteger(req.query.page, 1, 1_000_000);
        const limit = parsePositiveInteger(req.query.limit, 20, 100);
        const query = Announcement.find()
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("author", "firstName lastName")
            .lean();

        const [announcements, total] = await Promise.all([
            query,
            Announcement.countDocuments(),
        ]);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: {
                announcements,
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
        console.error("listAnnouncements:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const createAnnouncement = async (req, res) => {
    let announcement;
    try {
        if (typeof req.body?.title !== "string" || typeof req.body?.message !== "string") {
            return res.status(400).json({
                success: false,
                message: "Title and message are required.",
            });
        }

        const title = req.body.title.trim();
        const message = req.body.message.trim();
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }
        if (title.length > 120) {
            return res.status(400).json({ success: false, message: "Title must be 120 characters or less." });
        }
        if (message.length > 2000) {
            return res.status(400).json({ success: false, message: "Message must be 2000 characters or less." });
        }

        announcement = await Announcement.create({
            author: req.user._id,
            title,
            message,
            status: "sending",
        });

        const users = await User.find({
            role: { $in: ["customer", "provider", "secretary"] },
            isActive: { $ne: false },
        })
            .select("_id")
            .lean();
        const userIds = users.map((user) => user._id);
        const webConfigured = isWebPushConfigured();
        const mobileConfigured = isMobilePushConfigured();
        const delivery = {
            targetUsers: userIds.length,
            webDevices: 0,
            mobileDevices: 0,
            webSent: 0,
            webFailed: 0,
            mobileSent: 0,
            mobileFailed: 0,
            webConfigured,
            mobileConfigured,
        };
        announcement.delivery = delivery;
        await announcement.save();

        for (let index = 0; index < userIds.length; index += DELIVERY_BATCH_SIZE) {
            const batch = userIds.slice(index, index + DELIVERY_BATCH_SIZE);
            const [webDevices, mobileDevices] = await Promise.all([
                PushSubscription.countDocuments({ user: { $in: batch } }),
                MobilePushDevice.countDocuments({ user: { $in: batch } }),
            ]);

            delivery.webDevices += webDevices;
            delivery.mobileDevices += mobileDevices;
            await createInAppNotifications(batch, {
                category: "announcements",
                title,
                message,
            });

            const pushResult = await sendPushToUsers(batch, {
                title,
                body: message,
                url: "/notifications",
                tag: `announcement-${String(announcement._id)}`,
            });
            delivery.webSent += pushResult.web?.sent || 0;
            delivery.webFailed += pushResult.web?.failed || 0;
            delivery.mobileSent += pushResult.mobile?.sent || 0;
            delivery.mobileFailed += pushResult.mobile?.failed || 0;

            announcement.delivery = delivery;
            await announcement.save();
        }

        const webExpected = webConfigured ? delivery.webDevices : 0;
        const mobileExpected = mobileConfigured ? delivery.mobileDevices : 0;
        const attempted = delivery.webSent + delivery.webFailed + delivery.mobileSent + delivery.mobileFailed;
        const expected = webExpected + mobileExpected;
        announcement.status = attempted === expected ? "sent" : attempted > 0 ? "partial" : "failed";
        announcement.delivery = delivery;
        await announcement.save();

        return res.status(201).json({
            success: true,
            message: "Announcement saved and delivery processed.",
            data: { announcement },
        });
    } catch (error) {
        if (announcement) {
            try {
                announcement.status = "partial";
                await announcement.save();
            } catch (saveError) {
                console.error("createAnnouncement status update failed:", saveError.message);
            }
        }
        console.error("createAnnouncement:", error.message);
        return res.status(500).json({ success: false, message: "Announcement could not be fully processed." });
    }
};
