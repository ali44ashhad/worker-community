import mongoose from "mongoose";

const { Schema } = mongoose;

const localitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        status: {
            type: String,
            enum: ["active", "comingSoon"],
            default: "comingSoon",
        },
        /** Horizontal position on the map as percentage (0–100). */
        x: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 50,
        },
        /** Vertical position on the map as percentage (0–100). */
        y: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 50,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

localitySchema.index({ isVisible: 1, sortOrder: 1, createdAt: 1 });

const Locality = mongoose.model("Locality", localitySchema);

export default Locality;
