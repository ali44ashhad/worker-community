import mongoose from "mongoose";

const { Schema } = mongoose;

const pushSubscriptionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            unique: true,
        },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
        },
        userAgent: {
            type: String,
            default: "",
            maxlength: 500,
        },
    },
    { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1, endpoint: 1 });

const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
