import mongoose from "mongoose";

/** Sidebar badge keys — must match client inboxBadgeMap */
export const INBOX_CATEGORIES = [
    "approvals",
    "communities",
    "broadcast",
    "events",
    "registration",
];

const inAppNotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            enum: INBOX_CATEGORIES,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

inAppNotificationSchema.index({ user: 1, category: 1, readAt: 1, createdAt: -1 });

const InAppNotification = mongoose.model("InAppNotification", inAppNotificationSchema);

export default InAppNotification;
