import mongoose from "mongoose";

const { Schema } = mongoose;

const communityEventSchema = new Schema(
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
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        eventType: {
            type: String,
            enum: ["communityMeetup", "marketDay", "workshop", "sports", "fundraiser"],
            default: "communityMeetup",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        attachments: [
            {
                kind: {
                    type: String,
                    enum: ["image", "pdf", "video", "link"],
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                },
                name: {
                    type: String,
                    trim: true,
                    default: "",
                    maxlength: 120,
                },
                publicId: {
                    type: String,
                    trim: true,
                    default: "",
                },
            },
        ],
    },
    { timestamps: true }
);

communityEventSchema.index({ communityCommunName: 1, expiresAt: -1, createdAt: -1 });

const CommunityEvent = mongoose.model("CommunityEvent", communityEventSchema);

export default CommunityEvent;
