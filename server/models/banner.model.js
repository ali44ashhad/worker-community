import mongoose from "mongoose";

const { Schema } = mongoose;

const bannerSchema = new Schema(
    {
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        public_id: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

bannerSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
