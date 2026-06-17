import mongoose from "mongoose";

const { Schema } = mongoose;

const serviceOfferingSchema = new Schema({
    provider: {
        type: Schema.Types.ObjectId,
        ref: "ProviderProfile",
        required: true,
    },
    servicename: {
        type: String,
        required: true,
        trim: true
    },
    serviceCategory: {
        type: String,
        required: true,
    },
    subCategories: [String],
    keywords: [String],
    portfolioImages: [
        {
            url: { type: String, required: true },
            // Optional: when service has no uploads we store default local logo (/CommuN-logo.png)
            // which has no S3 object key in public_id.
            public_id: { type: String, required: false },
        },
    ],
    portfolioPDFs: [
        {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
        },
    ],
    description: { type: String, default: "" },
    experience: {
        type: Number,
        min: [0, "Experience cannot be negative"],
        default: 0
    },
    serviceOfferingCount: {
        type: Number,
        default: 0,
        min: [0, "Count cannot be negative"]
    }
}, { timestamps: true });
 
serviceOfferingSchema.index({ serviceCategory: 1 });

const ServiceOffering = mongoose.model("ServiceOffering", serviceOfferingSchema);

export default ServiceOffering;