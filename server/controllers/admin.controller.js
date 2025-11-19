import User from "../models/user.model.js";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Helper functions for Cloudinary
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "service_offerings" },
            (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, public_id: result.public_id });
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

const deleteFromCloudinary = (public_id) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(public_id, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

/**
 * @description Get all dashboard statistics for the admin
 * @route GET /api/admin/dashboard-stats
 * @access Private (Admin)
 */

const getAdminDashboardStats = async (req, res) => {
    try {
        // 1. Get user counts by role
        const userStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Format the stats into a clean object
        const roleCounts = {
            customer: 0,
            provider: 0,
            admin: 0
        };
        let totalUsers = 0;
        
        userStats.forEach(stat => {
            if (roleCounts.hasOwnProperty(stat._id)) {
                roleCounts[stat._id] = stat.count;
            }
            totalUsers += stat.count;
        });

        // 2. Get total providers count
        const totalProviders = await ProviderProfile.countDocuments();

        // 3. Get total service offerings count
        const totalServices = await ServiceOffering.countDocuments();

        // 4. Get 5 Recent Providers from the platform
        const recentProviders = await ProviderProfile.find({})
            .populate('user', 'name profileImage email phoneNumber address createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // 5. Get top categories (based on serviceOfferingCount aggregated by category)
        const topCategoriesData = await ServiceOffering.aggregate([
            {
                $group: {
                    _id: "$serviceCategory",
                    totalClicks: { $sum: "$serviceOfferingCount" },
                    serviceCount: { $sum: 1 }
                }
            },
            { $sort: { totalClicks: -1 } },
            { $limit: 10 }
        ]);

        const topCategories = topCategoriesData.map(cat => ({
            category: cat._id,
            totalClicks: cat.totalClicks || 0,
            serviceCount: cat.serviceCount || 0
        }));

        // 6. Get top services (based on serviceOfferingCount)
        const topServices = await ServiceOffering.find({})
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'name profileImage'
                }
            })
            .sort({ serviceOfferingCount: -1 })
            .limit(10)
            .select('serviceCategory serviceOfferingCount description portfolioImages provider');

        // 7. Get top providers (based on providerProfileCount)
        const topProviders = await ProviderProfile.find({})
            .populate('user', 'name profileImage email phoneNumber address')
            .sort({ providerProfileCount: -1 })
            .limit(10)
            .select('providerProfileCount bio user');

        // 8. Send the final response
        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                roleCounts,
                totalProviders,
                totalServices,
                recentProviders,
                topCategories,
                topServices,
                topProviders
            }
        });

    } catch (error) {
        console.error("Error in getAdminDashboardStats controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get all providers on the platform
 * @route GET /api/admin/all-providers
 * @access Private (Admin)
 */

const getAllProviders = async (req, res) => {
    try {
        // Find all provider profiles with their user and service offerings
        const providers = await ProviderProfile.find({})
            .populate('user', 'name profileImage email phoneNumber address role createdAt')
            .populate('serviceOfferings')
            .sort({ createdAt: -1 }); // Show newest first

        return res.status(200).json({
            success: true,
            providers
        });

    } catch (error) {
        console.error("Error in getAllProviders controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update a provider's details (admin only)
 * @route PUT /api/admin/update-provider/:providerId
 * @access Private (Admin)
 */

const updateProviderDetails = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { bio } = req.body;

        // Find the provider profile
        const providerProfile = await ProviderProfile.findById(providerId);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // Update bio if provided
        if (bio !== undefined) {
            providerProfile.bio = bio;
            await providerProfile.save();
        }

        // Populate and return updated provider
        const updatedProvider = await ProviderProfile.findById(providerId)
            .populate('user', 'name profileImage email phoneNumber address role')
            .populate('serviceOfferings');

        return res.status(200).json({
            success: true,
            message: "Provider details updated successfully.",
            provider: updatedProvider
        });

    } catch (error) {
        console.error("Error in updateProviderDetails controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update provider's user details (admin only)
 * @route PUT /api/admin/update-provider-user/:providerId
 * @access Private (Admin)
 */

const updateProviderUserDetails = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { name, email, phoneNumber, address } = req.body;

        // Find the provider profile to get the user ID
        const providerProfile = await ProviderProfile.findById(providerId);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const userId = providerProfile.user;

        // Update user details
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (address !== undefined) updateData.address = address;

        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        }

        // Populate and return updated provider
        const updatedProvider = await ProviderProfile.findById(providerId)
            .populate('user', 'name profileImage email phoneNumber address role')
            .populate('serviceOfferings');

        return res.status(200).json({
            success: true,
            message: "Provider user details updated successfully.",
            provider: updatedProvider
        });

    } catch (error) {
        console.error("Error in updateProviderUserDetails controller:", error.message);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};


/**
 * @description Get all service offerings on the platform
 * @route GET /api/admin/all-services
 * @access Private (Admin)
 */

const getAllServices = async (req, res) => {
    try {
        // Find all service offerings with their provider and user info
        const services = await ServiceOffering.find({})
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'name profileImage email phoneNumber address'
                }
            })
            .sort({ createdAt: -1 }); // Show newest first

        return res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        console.error("Error in getAllServices controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update a service offering (admin only)
 * @route PUT /api/admin/update-service/:serviceId
 * @access Private (Admin)
 */

const updateServiceDetails = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { serviceCategory, subCategories, keywords, description, experience } = req.body;

        // Find the service offering
        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Update service fields
        if (serviceCategory !== undefined) service.serviceCategory = serviceCategory;
        
        // Parse subCategories if it's a JSON string
        if (subCategories !== undefined) {
            let parsedSubCategories = subCategories;
            if (typeof subCategories === 'string') {
                try {
                    parsedSubCategories = JSON.parse(subCategories);
                } catch (e) {
                    parsedSubCategories = [subCategories];
                }
            }
            service.subCategories = Array.isArray(parsedSubCategories) ? parsedSubCategories : [parsedSubCategories];
        }
        
        // Parse keywords if it's a JSON string
        if (keywords !== undefined) {
            let parsedKeywords = keywords;
            if (typeof keywords === 'string') {
                try {
                    parsedKeywords = JSON.parse(keywords);
                } catch (e) {
                    parsedKeywords = [keywords];
                }
            }
            service.keywords = Array.isArray(parsedKeywords) ? parsedKeywords : [parsedKeywords];
        }
        
        if (description !== undefined) service.description = description;
        if (experience !== undefined) service.experience = parseInt(experience);

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadBufferToCloudinary(file.buffer));
            const newImages = await Promise.all(uploadPromises);
            
            // Add new images to existing ones
            service.portfolioImages = [...service.portfolioImages, ...newImages];
        }

        await service.save();

        // Populate and return updated service
        const updatedService = await ServiceOffering.findById(serviceId)
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'name profileImage email phoneNumber address'
                }
            });

        return res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            service: updatedService
        });

    } catch (error) {
        console.error("Error in updateServiceDetails controller:", error.message);
        return res.status(400).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

/**
 * @description Delete an image from a service offering (admin only)
 * @route DELETE /api/admin/service/:serviceId/image?publicId=xxx
 * @access Private (Admin)
 */

const deleteServiceImage = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { publicId } = req.query;
        
        if (!publicId) {
            return res.status(400).json({ success: false, message: "Image public ID is required." });
        }
        
        const imagePublicId = publicId;

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Find and remove the image
        const imageIndex = service.portfolioImages.findIndex(img => img.public_id === imagePublicId);
        if (imageIndex === -1) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(imagePublicId);

        // Remove from array
        service.portfolioImages.splice(imageIndex, 1);
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully.",
            service
        });

    } catch (error) {
        console.error("Error in deleteServiceImage controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { 
    getAdminDashboardStats,
    getAllProviders,
    updateProviderDetails,
    updateProviderUserDetails,
    getAllServices,
    updateServiceDetails,
    deleteServiceImage
};