import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
    // New association: comment is tied to a specific ServiceOffering
    serviceOffering: {
        type: Schema.Types.ObjectId,
        ref: "ServiceOffering",
        required: true
    },

    // Optional legacy field kept for backward compatibility (no longer required)
    provider: {
        type: Schema.Types.ObjectId,
        ref: "ProviderProfile",
        required: false
    },

    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reply: {
        type: String,
        required: false
    },
    replyBy: {
        type: Schema.Types.ObjectId,
        ref: "ProviderProfile",
        required: false
    },
    replyCreatedAt: {
        type: Date,
        required: false
    }
}, { timestamps: true });

// Add indexes for performance optimization
// Index on serviceOffering for fast lookups and aggregations
commentSchema.index({ serviceOffering: 1 });

// Compound index for serviceOffering + rating (used in top-services aggregation)
commentSchema.index({ serviceOffering: 1, rating: 1 });

// Index on rating for sorting operations
commentSchema.index({ rating: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;