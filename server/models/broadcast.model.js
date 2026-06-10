import mongoose from "mongoose";

const { Schema } = mongoose;

const broadcastSchema = new Schema(
    {
        communityCommunName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 40,
        },
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
    },
    { timestamps: true }
);

broadcastSchema.index({ communityCommunName: 1, createdAt: -1 });

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;
