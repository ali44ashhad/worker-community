import mongoose from "mongoose";

const { Schema } = mongoose;

const businessCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 60,
    },
    subCategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

businessCategorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

const BusinessCategory = mongoose.model("BusinessCategory", businessCategorySchema);

export default BusinessCategory;
