import InAppNotification, { INBOX_CATEGORIES } from "../models/inAppNotification.model.js";

function normalizeDestination(destination) {
    const value = String(destination || "").trim();
    if (!value) return "";
    if (
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.includes("\\") ||
        /[\r\n]/.test(value)
    ) {
        throw new Error("Notification destination must be an internal path.");
    }
    return value.slice(0, 500);
}

export async function createInAppNotifications(userIds, {
    category,
    title,
    message,
    destination,
} = {}) {
    const cat = String(category || "").trim();
    if (!INBOX_CATEGORIES.includes(cat)) return;

    const ids = [...new Set((userIds || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) return;

    const notificationTitle = String(title || "").trim().slice(0, 120);
    const notificationMessage = String(message || "").trim().slice(0, 2000);
    if (!notificationTitle || !notificationMessage) {
        throw new Error("Notification title and message are required.");
    }
    const normalizedDestination = normalizeDestination(destination);

    for (let index = 0; index < ids.length; index += 500) {
        const docs = ids.slice(index, index + 500).map((userId) => ({
            user: userId,
            category: cat,
            title: notificationTitle,
            message: notificationMessage,
            destination: normalizedDestination,
            readAt: null,
        }));
        await InAppNotification.insertMany(docs, { ordered: false });
    }
}

export async function listNotificationsForUser(userId, { page, limit, category } = {}) {
    const query = { user: userId };
    if (category) query.category = category;

    const [notifications, total] = await Promise.all([
        InAppNotification.find(query)
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("_id category title message destination readAt createdAt")
            .lean(),
        InAppNotification.countDocuments(query),
    ]);

    return { notifications, total };
}

export async function getUnreadCountsForUser(userId) {
    const rows = await InAppNotification.aggregate([
        {
            $match: {
                user: userId,
                readAt: null,
            },
        },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
            },
        },
    ]);

    const counts = {};
    for (const key of INBOX_CATEGORIES) {
        counts[key] = 0;
    }
    for (const row of rows) {
        counts[row._id] = row.count;
    }
    return counts;
}

export async function markInboxCategoryRead(userId, category) {
    const cat = String(category || "").trim();
    if (!INBOX_CATEGORIES.includes(cat)) {
        return { modified: 0 };
    }

    const result = await InAppNotification.updateMany(
        { user: userId, category: cat, readAt: null },
        { $set: { readAt: new Date() } }
    );

    return { modified: result.modifiedCount || 0 };
}

export async function markNotificationRead(userId, notificationId) {
    await InAppNotification.updateOne(
        { _id: notificationId, user: userId, readAt: null },
        { $set: { readAt: new Date() } }
    );

    return InAppNotification.findOne({ _id: notificationId, user: userId })
        .select("_id category title message destination readAt createdAt")
        .lean();
}
