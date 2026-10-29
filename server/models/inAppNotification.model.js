import mongoose from "mongoose";

/** Sidebar badge keys — must match client inboxBadgeMap */
export const INBOX_CATEGORIES = [
    "approvals",
    "communities",
    "broadcast",
    "events",
    "registration",
    "announcements",
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
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        destination: {
            type: String,
            default: "",
            maxlength: 500,
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
