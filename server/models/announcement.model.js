import mongoose from "mongoose";

const { Schema } = mongoose;

const announcementSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
        status: {
            type: String,
            enum: ["sending", "sent", "partial", "failed"],
            default: "sending",
        },
        delivery: {
            targetUsers: { type: Number, default: 0 },
            webDevices: { type: Number, default: 0 },
            mobileDevices: { type: Number, default: 0 },
            webSent: { type: Number, default: 0 },
            webFailed: { type: Number, default: 0 },
            mobileSent: { type: Number, default: 0 },
            mobileFailed: { type: Number, default: 0 },
            webConfigured: { type: Boolean, default: false },
            mobileConfigured: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
