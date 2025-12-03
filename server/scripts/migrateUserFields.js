import mongoose from "mongoose";
import "dotenv/config";

// Temporary schema to read old data structure
const tempUserSchema = new mongoose.Schema({
    name: String,
    address: String,
    firstName: String,
    lastName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zip: String
}, { strict: false, timestamps: true });

const TempUser = mongoose.models.User || mongoose.model("User", tempUserSchema);

const migrateUserFields = async () => {
    try {
        // Connect to database
        await mongoose.connect(`${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`);
        console.log("Connected to database");

        // Get all users
        const users = await TempUser.find({});
        console.log(`Found ${users.length} users to migrate`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            const updates = {};

            // Migrate name to firstName and lastName
            if (user.name && !user.firstName && !user.lastName) {
                const nameParts = user.name.trim().split(/\s+/);
                if (nameParts.length > 0) {
                    updates.firstName = nameParts[0];
                    updates.lastName = nameParts.slice(1).join(' ') || nameParts[0]; // If only one word, use it for both
                } else {
                    updates.firstName = '';
                    updates.lastName = '';
                }
            }

            // Clear old address and initialize new address fields if they don't exist
            if (user.address && (!user.addressLine1 && !user.addressLine2 && !user.city && !user.state && !user.zip)) {
                // Set new address fields to empty strings
                updates.addressLine1 = '';
                updates.addressLine2 = '';
                updates.city = '';
                updates.state = '';
                updates.zip = '';
            }

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                await TempUser.findByIdAndUpdate(user._id, updates);
                migrated++;
                console.log(`Migrated user: ${user._id} - Name: "${user.name}" -> FirstName: "${updates.firstName}", LastName: "${updates.lastName}"`);
            } else {
                skipped++;
            }
        }

        console.log(`\nMigration complete!`);
        console.log(`Migrated: ${migrated} users`);
        console.log(`Skipped: ${skipped} users (already migrated or no changes needed)`);

        await mongoose.disconnect();
        console.log("Disconnected from database");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

// Run migration
migrateUserFields();
