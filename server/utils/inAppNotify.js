import InAppNotification, { INBOX_CATEGORIES } from "../models/inAppNotification.model.js";

export async function createInAppNotifications(userIds, category) {
    const cat = String(category || "").trim();
    if (!INBOX_CATEGORIES.includes(cat)) return;

    const ids = [...new Set((userIds || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) return;

    const docs = ids.map((userId) => ({
        user: userId,
        category: cat,
        readAt: null,
    }));

    await InAppNotification.insertMany(docs, { ordered: false });
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
