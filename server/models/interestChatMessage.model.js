import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        interestCommunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterestCommunity",
            required: true,
            index: true,
        },
        communName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterestChatMessage",
            default: null,
            index: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        editedAt: {
            type: Date,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
            index: true,
        },
    },
    { timestamps: true }
);

chatMessageSchema.index({ interestCommunity: 1, communName: 1, createdAt: -1 });

const InterestChatMessage = mongoose.model("InterestChatMessage", chatMessageSchema);

export default InterestChatMessage;
