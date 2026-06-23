import mongoose from "mongoose";

const interestCommunitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: 80,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const InterestCommunity = mongoose.model("InterestCommunity", interestCommunitySchema);

export default InterestCommunity;
