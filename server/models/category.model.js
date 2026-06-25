import mongoose from "mongoose";
import { DEFAULT_CATEGORY_ICON } from "../utils/categoryIcons.js";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    subCategories: {
      type: [String],
      default: [],
    },
    keywords: {
      // UI calls these "Specializations"
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: DEFAULT_CATEGORY_ICON,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
