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
    role: {
        type: String,
        enum: ["customer", "provider", "admin"],
        default: "customer"
    },
    profileImage: {
        type: String,
        default: ""
    },
    // Wishlist: array of serviceOffering IDs
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'ServiceOffering', default: [] }]
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