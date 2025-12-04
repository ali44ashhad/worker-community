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
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip createdAt')
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
                    select: 'firstName lastName profileImage'
                }
            })
            .sort({ serviceOfferingCount: -1 })
            .limit(10)
            .select('serviceCategory serviceOfferingCount description portfolioImages provider');

        // 7. Get top providers (based on providerProfileCount)
        const topProviders = await ProviderProfile.find({})
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip')
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
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip role createdAt')
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
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip role')
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
        const { firstName, lastName, email, phoneNumber, addressLine1, addressLine2, city, state, zip } = req.body;

        // Find the provider profile to get the user ID
        const providerProfile = await ProviderProfile.findById(providerId);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const userId = providerProfile.user;

        // Update user details
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (zip !== undefined) updateData.zip = zip;

        if (Object.keys(updateData).length > 0) {
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        }

        // Populate and return updated provider
        const updatedProvider = await ProviderProfile.findById(providerId)
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip role')
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
                    select: 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip'
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
        const { servicename, serviceCategory, subCategories, keywords, description, experience } = req.body;

        // Find the service offering first to check if it exists
        const existingService = await ServiceOffering.findById(serviceId);
        if (!existingService) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Build update object
        const updateData = {};

        // Update servicename if provided
        if (servicename !== undefined && servicename !== null) {
            const trimmedServicename = typeof servicename === 'string' ? servicename.trim() : servicename;
            if (trimmedServicename !== '') {
                updateData.servicename = trimmedServicename;
            }
        }

        if (serviceCategory !== undefined) updateData.serviceCategory = serviceCategory;
        
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
            updateData.subCategories = Array.isArray(parsedSubCategories) ? parsedSubCategories : [parsedSubCategories];
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
            updateData.keywords = Array.isArray(parsedKeywords) ? parsedKeywords : [parsedKeywords];
        }
        
        if (description !== undefined) updateData.description = description;
        if (experience !== undefined) updateData.experience = parseInt(experience);

        // Update regular fields first if there are any
        if (Object.keys(updateData).length > 0) {
            await ServiceOffering.findByIdAndUpdate(
                serviceId,
                updateData,
                { new: true, runValidators: true }
            );
        }

        // Handle new images and PDFs if uploaded (separate update for array operations)
        if (req.files && req.files.length > 0) {
            // Filter files by fieldname
            const images = req.files.filter(file => file.fieldname === 'portfolioImages');
            const pdfs = req.files.filter(file => file.fieldname === 'portfolioPDFs');
            
            // Handle new images if uploaded
            if (images.length > 0) {
                const imageUploadPromises = images.map(file => uploadBufferToCloudinary(file.buffer));
                const newImages = await Promise.all(imageUploadPromises);
                await ServiceOffering.findByIdAndUpdate(
                    serviceId,
                    { $push: { portfolioImages: { $each: newImages } } },
                    { new: true }
                );
            }
            
            // Handle new PDFs if uploaded
            if (pdfs.length > 0) {
                const pdfUploadPromises = pdfs.map(file => uploadBufferToCloudinary(file.buffer));
                const newPDFs = await Promise.all(pdfUploadPromises);
                await ServiceOffering.findByIdAndUpdate(
                    serviceId,
                    { $push: { portfolioPDFs: { $each: newPDFs } } },
                    { new: true }
                );
            }
        }

        // Populate and return updated service
        const updatedService = await ServiceOffering.findById(serviceId)
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip'
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

/**
 * @description Delete a PDF from a service offering (admin only)
 * @route DELETE /api/admin/service/:serviceId/pdf?publicId=xxx
 * @access Private (Admin)
 */

const deleteServicePDF = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { publicId } = req.query;
        
        if (!publicId) {
            return res.status(400).json({ success: false, message: "PDF public ID is required." });
        }
        
        const pdfPublicId = publicId;

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Find and remove the PDF
        const pdfIndex = service.portfolioPDFs?.findIndex(pdf => pdf.public_id === pdfPublicId) ?? -1;
        if (pdfIndex === -1) {
            return res.status(404).json({ success: false, message: "PDF not found." });
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(pdfPublicId);

        // Remove from array
        service.portfolioPDFs.splice(pdfIndex, 1);
        await service.save();

        return res.status(200).json({
            success: true,
            message: "PDF deleted successfully.",
            service
        });

    } catch (error) {
        console.error("Error in deleteServicePDF controller:", error.message);
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
    deleteServiceImage,
    deleteServicePDF
};