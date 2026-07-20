import mongoose from "mongoose";

const { Schema } = mongoose;

const mobilePushDeviceSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        platform: {
            type: String,
            enum: ["android", "ios"],
            required: true,
        },
        appId: {
            type: String,
            default: "",
            maxlength: 200,
        },
        deviceId: {
            type: String,
            default: "",
            maxlength: 200,
        },
        userAgent: {
            type: String,
            default: "",
            maxlength: 500,
        },
    },
    { timestamps: true }
);

mobilePushDeviceSchema.index({ user: 1, platform: 1 });
mobilePushDeviceSchema.index({ user: 1, deviceId: 1 });

const MobilePushDevice = mongoose.model("MobilePushDevice", mobilePushDeviceSchema);

export default MobilePushDevice;
