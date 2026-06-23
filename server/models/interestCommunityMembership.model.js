import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        interestCommunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InterestCommunity",
            required: true,
        },
        memberCommunName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
    },
    { timestamps: true }
);

membershipSchema.index({ user: 1, interestCommunity: 1 }, { unique: true });
membershipSchema.index({ interestCommunity: 1, memberCommunName: 1 });

const InterestCommunityMembership = mongoose.model(
    "InterestCommunityMembership",
    membershipSchema
);

export default InterestCommunityMembership;
