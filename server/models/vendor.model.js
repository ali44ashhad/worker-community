import mongoose from "mongoose";

const { Schema } = mongoose;

const vendorSchema = new Schema(
  {
    communityCommunName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: "",
    },
    service: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

vendorSchema.index({ communityCommunName: 1, category: 1, createdAt: -1 });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;

