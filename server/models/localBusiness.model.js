import mongoose from "mongoose";

const { Schema } = mongoose;

const localBusinessSchema = new Schema(
  {
    communityCommunName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    logoPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    bannerUrl: {
      type: String,
      trim: true,
      default: "",
    },
    bannerPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    /** Master business categories (e.g. Salon, Restaurant). */
    businessCategories: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one business category is required.",
      },
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    /** Services/products that receive the discount. */
    discountedCategories: {
      type: [String],
      default: [],
    },
    /** Services/products explicitly excluded from the discount. */
    nonDiscountedCategories: {
      type: [String],
      default: [],
    },
    discountStartDate: {
      type: Date,
      required: true,
    },
    discountEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

localBusinessSchema.index({ communityCommunName: 1, status: 1, createdAt: -1 });
localBusinessSchema.index({ communityCommunName: 1, businessName: "text", description: "text" });
localBusinessSchema.index({ communityCommunName: 1, businessCategories: 1 });

const LocalBusiness = mongoose.model("LocalBusiness", localBusinessSchema);

export default LocalBusiness;
