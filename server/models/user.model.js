import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    addressLine2: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    state: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    zip: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    /** Unique handle for Commun (secretaries; providers who claimed a unique handle). */
    communName: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
        unique: true,
        maxlength: 40,
    },
    /**
     * Commun community chosen at signup: must match an active secretary's `communName`.
     * Many members can share the same value (not globally unique).
     */
    communityCommunName: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 40,
        default: "",
    },
    role: {
        type: String,
        enum: ["customer", "provider", "admin", "secretary"],
        default: "customer"
    },
    /** Signup / provider application must be approved by a secretary (legacy users: treat missing as approved). */
    accountStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved",
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    resetPasswordToken: {
        type: String,
        default: ""
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
     wishlist: [{ type: Schema.Types.ObjectId, ref: 'ServiceOffering', default: [] }],
    /** Secretary-only: show broadcast/events to community members. */
    featureToggles: {
        broadcast: { type: Boolean, default: false },
        events: { type: Boolean, default: false },
    },
    /** Secretary-only: which community event types are visible to members. */
    eventToggles: {
        communityMeetup: { type: Boolean, default: true },
        marketDay: { type: Boolean, default: false },
        workshop: { type: Boolean, default: false },
        sports: { type: Boolean, default: false },
        fundraiser: { type: Boolean, default: false },
    },
    /** Secretary-only: which service categories are visible in this community. */
    categoryToggles: {
        type: Map,
        of: Boolean,
        default: {},
    },
}, { timestamps: true });

// Virtual field for backward compatibility - combines firstName and lastName
userSchema.virtual('name').get(function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    // Fallback for migrated data that might still have old name field
    return this.firstName || '';
});

// Virtual field for backward compatibility - formats address fields
userSchema.virtual('address').get(function() {
    const parts = [];
    if (this.addressLine1) parts.push(this.addressLine1);
    if (this.addressLine2) parts.push(this.addressLine2);
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.zip) parts.push(this.zip);
    return parts.join(', ') || '';
});

// Ensure virtual fields are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;