import mongoose from "mongoose";

const { Schema } = mongoose;

const emergencyContactSchema = new Schema(
  {
    communityCommunName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      // e.g. "Police", "SOS", "Lift technician", "Secretary"
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    notes: {
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

emergencyContactSchema.index({ communityCommunName: 1, title: 1, createdAt: -1 });

const EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema);

export default EmergencyContact;

