import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import Category from "../models/category.model.js";
import { validateCategorySelection } from "../utils/categoryValidation.js";
import {
    S3_FOLDERS,
    deleteFromS3,
    deleteFromS3Safe,
    uploadBufferToS3,
} from "../utils/s3Upload.js";
import { isValidCommunName, normalizeCommunName } from "../utils/communName.js";
import { normalizeCategoryIcon } from "../utils/categoryIcons.js";

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
            admin: 0,
            secretary: 0
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

        // 7. Get top providers ranked by sum of their service clicks
        const topProvidersAgg = await ServiceOffering.aggregate([
            {
                $group: {
                    _id: "$provider",
                    totalServiceClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } },
                    serviceCount: { $sum: 1 },
                },
            },
            { $sort: { totalServiceClicks: -1, serviceCount: -1 } },
            { $limit: 10 },
        ]);

        const topProviderIds = topProvidersAgg.map((row) => row._id).filter(Boolean);
        const topProviderDocs = topProviderIds.length
            ? await ProviderProfile.find({ _id: { $in: topProviderIds } })
                .populate(
                    "user",
                    "firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip"
                )
                .select("bio user")
                .lean()
            : [];

        const topProviderMap = new Map(
            topProviderDocs.map((doc) => [doc._id.toString(), doc])
        );

        const topProviders = topProvidersAgg
            .map((row) => {
                const provider = topProviderMap.get(row._id.toString());
                if (!provider) return null;
                return {
                    _id: provider._id,
                    bio: provider.bio,
                    user: provider.user,
                    // Keep field name for existing dashboard UI, but value = service clicks sum
                    providerProfileCount: row.totalServiceClicks || 0,
                    serviceCount: row.serviceCount || 0,
                };
            })
            .filter(Boolean);

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
 * @description Get all providers on the platform with pagination
 * @route GET /api/admin/all-providers
 * @access Private (Admin)
 * @queryParams page (default: 1), limit (default: 10), search (optional)
 */

const getAllProviders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Hide deactivated users even in admin provider/service lists.
        // Combine the active-user filter with the search filter in a single query so
        // one condition doesn't overwrite the other.
        const userFilter = { isActive: { $ne: false } };
        if (search.trim()) {
            userFilter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const matchingUsers = await User.find(userFilter).select('_id');
        const matchingUserIds = matchingUsers.map((user) => user._id);

        const providerQuery = { user: { $in: matchingUserIds } };

        const totalProviders = await ProviderProfile.countDocuments(providerQuery);

        const providers = await ProviderProfile.find(providerQuery)
            .populate('user', 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip role createdAt isActive')
            .populate('serviceOfferings')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProviders / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            providers,
            pagination: {
                currentPage: page,
                totalPages,
                totalProviders,
                hasNextPage,
                hasPrevPage,
                limit
            }
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
 * @description Get all service offerings on the platform with pagination
 * @route GET /api/admin/all-services
 * @access Private (Admin)
 * @queryParams page (default: 1), limit (default: 10), search (optional)
 */

const getAllServices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {};
        if (search.trim()) {
            // Search in service name, category, keywords, and provider name/email
            const searchLower = search.trim().toLowerCase();
            
            // First, find users that match the search (for provider name/email)
            const matchingUsers = await User.find({
                $or: [
                    { firstName: { $regex: search.trim(), $options: 'i' } },
                    { lastName: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } }
                ]
            }).select('_id');
            
            const userIds = matchingUsers.map(user => user._id);
            
            // Find providers that reference these users
            let providerIds = [];
            if (userIds.length > 0) {
                const matchingProviders = await ProviderProfile.find({
                    user: { $in: userIds }
                }).select('_id');
                providerIds = matchingProviders.map(p => p._id);
            }
            
            // Build search query for services
            const searchConditions = [
                { servicename: { $regex: search.trim(), $options: 'i' } },
                { serviceCategory: { $regex: search.trim(), $options: 'i' } },
                { keywords: { $regex: search.trim(), $options: 'i' } }
            ];
            
            if (providerIds.length > 0) {
                searchConditions.push({ provider: { $in: providerIds } });
            }
            
            searchQuery = { $or: searchConditions };
        }

        // Only include services whose provider's user is active
        const activeUsers = await User.find({ isActive: { $ne: false } }).select("_id");
        const activeUserIds = activeUsers.map((u) => u._id);
        const activeProviders = await ProviderProfile.find({ user: { $in: activeUserIds } }).select("_id");
        const activeProviderIds = activeProviders.map((p) => p._id);

        const serviceQuery = { ...searchQuery, provider: { ...(searchQuery.provider || {}), $in: activeProviderIds } };

        const totalServices = await ServiceOffering.countDocuments(serviceQuery);

        const services = await ServiceOffering.find(serviceQuery)
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'firstName lastName profileImage email phoneNumber addressLine1 addressLine2 city state zip isActive'
                }
            })
            .sort({ createdAt: -1 }) // Show newest first
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalServices / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            services,
            pagination: {
                currentPage: page,
                totalPages,
                totalServices,
                hasNextPage,
                hasPrevPage,
                limit
            }
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

        // Validate against DB-driven categories using the final values that will be saved
        const nextServiceCategory =
            updateData.serviceCategory !== undefined
                ? updateData.serviceCategory
                : existingService.serviceCategory;
        const nextSubCategories =
            updateData.subCategories !== undefined
                ? updateData.subCategories
                : existingService.subCategories || [];
        const nextKeywords =
            updateData.keywords !== undefined
                ? updateData.keywords
                : existingService.keywords || [];

        // When the category is unchanged, grandfather the values already stored on
        // the service so legacy taxonomy entries don't block edits like image uploads.
        const categoryChanged =
            String(nextServiceCategory || "") !== String(existingService.serviceCategory || "");

        await validateCategorySelection({
            serviceCategory: nextServiceCategory,
            subCategories: nextSubCategories,
            keywords: nextKeywords,
            existingSubCategories: categoryChanged ? [] : existingService.subCategories || [],
            existingKeywords: categoryChanged ? [] : existingService.keywords || [],
        });

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
                const imageUploadPromises = images.map(file => uploadBufferToS3(file));
                const newImages = await Promise.all(imageUploadPromises);
                await ServiceOffering.findByIdAndUpdate(
                    serviceId,
                    { $push: { portfolioImages: { $each: newImages } } },
                    { new: true }
                );
            }
            
            // Handle new PDFs if uploaded
            if (pdfs.length > 0) {
                const pdfUploadPromises = pdfs.map(file => uploadBufferToS3(file));
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

// ========================== CATEGORY MANAGEMENT (Admin) ==========================
const getAllCategoriesAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = (req.query.search || "").trim();
        const skip = (page - 1) * limit;

        const query = search
            ? { name: { $regex: search, $options: "i" } }
            : {};

        const [total, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.status(200).json({
            success: true,
            categories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalCategories: total,
                hasNextPage: skip + categories.length < total,
                hasPrevPage: page > 1,
                limit,
            },
        });
    } catch (error) {
        console.error("Error in getAllCategoriesAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const createCategoryAdmin = async (req, res) => {
    try {
        const { name, subCategories = [], keywords = [], icon, isActive = true } = req.body;
        const trimmedName = String(name || "").trim();
        if (!trimmedName) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const parseJsonArray = (value) => {
            if (value === undefined || value === null) return [];
            if (Array.isArray(value)) return value;
            if (typeof value !== "string") return [];
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        };

        const existing = await Category.findOne({ name: trimmedName });
        if (existing) {
            return res.status(409).json({ success: false, message: "Category already exists." });
        }

        const category = await Category.create({
            name: trimmedName,
            subCategories: parseJsonArray(subCategories),
            keywords: parseJsonArray(keywords),
            icon: normalizeCategoryIcon(icon, trimmedName),
            isActive: String(isActive) === "false" ? false : Boolean(isActive),
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category,
        });
    } catch (error) {
        console.error("Error in createCategoryAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateCategoryAdmin = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, subCategories, keywords, icon, isActive } = req.body;

        const parseJsonArray = (value) => {
            if (value === undefined || value === null) return [];
            if (Array.isArray(value)) return value;
            if (typeof value !== "string") return [];
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        };

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        if (name !== undefined) {
            const trimmedName = String(name || "").trim();
            if (!trimmedName) {
                return res.status(400).json({ success: false, message: "Category name cannot be empty." });
            }
            // ensure unique
            const dup = await Category.findOne({ name: trimmedName, _id: { $ne: categoryId } });
            if (dup) {
                return res.status(409).json({ success: false, message: "Another category with this name already exists." });
            }
            category.name = trimmedName;
        }

        if (subCategories !== undefined) {
            category.subCategories = parseJsonArray(subCategories);
        }
        if (keywords !== undefined) {
            category.keywords = parseJsonArray(keywords);
        }
        if (icon !== undefined) {
            category.icon = normalizeCategoryIcon(icon, category.name);
        }
        if (isActive !== undefined) {
            category.isActive = String(isActive) === "false" ? false : Boolean(isActive);
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category,
        });
    } catch (error) {
        console.error("Error in updateCategoryAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateCategoryStatusAdmin = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ success: false, message: "isActive is required." });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        category.isActive = Boolean(isActive);
        await category.save();

        return res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? "activated" : "deactivated"} successfully.`,
            category,
        });
    } catch (error) {
        console.error("Error in updateCategoryStatusAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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

        // Delete from S3
        await deleteFromS3(imagePublicId);

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
 * @description Set which portfolio image appears first (service card cover)
 * @route PATCH /api/admin/service/:serviceId/cover-image
 * @access Private (Admin)
 */
const setServiceCoverImage = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { publicId } = req.body || {};

        if (!publicId) {
            return res.status(400).json({ success: false, message: "Image public ID is required." });
        }

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        const images = service.portfolioImages || [];
        const imageIndex = images.findIndex((img) => img.public_id === publicId);
        if (imageIndex === -1) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }
        if (imageIndex === 0) {
            return res.status(200).json({
                success: true,
                message: "This image is already the cover.",
                service,
            });
        }

        const reordered = [...images];
        const [coverImage] = reordered.splice(imageIndex, 1);
        reordered.unshift(coverImage);
        service.portfolioImages = reordered;
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Cover image updated.",
            service,
        });
    } catch (error) {
        console.error("Error in setServiceCoverImage:", error.message);
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

        // Delete from S3
        await deleteFromS3(pdfPublicId);

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

/**
 * @description Get category clicks data - all categories with cumulative clicks and their services
 * @route GET /api/admin/category-clicks
 * @access Private (Admin)
 */
const getCategoryClicks = async (req, res) => {
    try {
        // Use DB categories (admin-managed). Include categories even if they have 0 clicks.
        const allCategories = await Category.find({}).select("name").lean();

        // Aggregate categories with cumulative clicks
        const categoryData = await ServiceOffering.aggregate([
            {
                $group: {
                    _id: "$serviceCategory",
                    totalClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } },
                    serviceCount: { $sum: 1 }
                }
            },
            { $sort: { totalClicks: -1 } }
        ]);

        // Create a map for quick lookup
        const categoryMap = new Map();
        categoryData.forEach(cat => {
            categoryMap.set(cat._id, {
                category: cat._id,
                totalClicks: cat.totalClicks || 0,
                serviceCount: cat.serviceCount || 0,
                services: []
            });
        });

        // Add categories with 0 clicks that exist in DB
        allCategories.forEach((c) => {
            const name = c?.name;
            if (!name) return;
            if (!categoryMap.has(name)) {
                categoryMap.set(name, {
                    category: name,
                    totalClicks: 0,
                    serviceCount: 0,
                    services: []
                });
            }
        });

        // Get all services with provider info using populate (simpler approach)
        const allServices = await ServiceOffering.find({})
            .populate({
                path: 'provider',
                populate: {
                    path: 'user',
                    select: 'firstName lastName'
                }
            })
            .select('serviceCategory servicename serviceOfferingCount provider')
            .lean();

        // Group services by category and sort by clicks
        allServices.forEach(service => {
            const category = service.serviceCategory;
            if (categoryMap.has(category)) {
                const providerName = service.provider?.user 
                    ? `${service.provider.user.firstName || ''} ${service.provider.user.lastName || ''}`.trim()
                    : 'Unknown Provider';
                
                categoryMap.get(category).services.push({
                    _id: service._id,
                    servicename: service.servicename,
                    serviceOfferingCount: service.serviceOfferingCount || 0,
                    provider: {
                        user: {
                            firstName: service.provider?.user?.firstName || '',
                            lastName: service.provider?.user?.lastName || ''
                        }
                    },
                    serviceCategory: service.serviceCategory
                });
            }
        });

        // Sort services within each category by clicks descending
        categoryMap.forEach((categoryInfo) => {
            categoryInfo.services.sort((a, b) => b.serviceOfferingCount - a.serviceOfferingCount);
        });

        // Convert map to array and sort by total clicks descending
        const result = Array.from(categoryMap.values())
            .sort((a, b) => b.totalClicks - a.totalClicks);

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const totalCategories = result.length;
        const totalPages = Math.max(Math.ceil(totalCategories / limit), 1);
        const paginatedResult = result.slice(skip, skip + limit);

        return res.status(200).json({
            success: true,
            data: paginatedResult,
            pagination: {
                currentPage: page,
                totalPages,
                totalCategories,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit,
            },
        });

    } catch (error) {
        console.error("Error in getCategoryClicks controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get provider clicks data - all providers with cumulative clicks and their services
 * @route GET /api/admin/provider-clicks
 * @access Private (Admin)
 */
const getProviderClicks = async (req, res) => {
    try {
        // Get all providers with their user information
        const allProviders = await ProviderProfile.find({})
            .populate('user', 'firstName lastName')
            .select('providerProfileCount user')
            .lean();

        // Get all services grouped by provider
        const servicesByProvider = await ServiceOffering.aggregate([
            {
                $group: {
                    _id: "$provider",
                    totalServiceClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } },
                    serviceCount: { $sum: 1 },
                    services: {
                        $push: {
                            _id: "$_id",
                            servicename: "$servicename",
                            serviceCategory: "$serviceCategory",
                            serviceOfferingCount: { $ifNull: ["$serviceOfferingCount", 0] }
                        }
                    }
                }
            }
        ]);

        // Create a map for quick lookup of service data by provider ID
        const serviceMap = new Map();
        servicesByProvider.forEach(item => {
            serviceMap.set(item._id.toString(), {
                totalServiceClicks: item.totalServiceClicks || 0,
                serviceCount: item.serviceCount || 0,
                services: item.services || []
            });
        });

        // Build result array with provider data
        const result = allProviders.map(provider => {
            const providerId = provider._id.toString();
            const serviceData = serviceMap.get(providerId) || {
                totalServiceClicks: 0,
                serviceCount: 0,
                services: []
            };

            // Provider clicks ko sirf services ke clicks ka sum rakha jaa raha hai.
            // (providerProfileCount ko is metric me include nahi kiya ja raha)
            const serviceTotalClicks = serviceData.totalServiceClicks || 0;
            const providerClicks = serviceTotalClicks;
            const totalClicks = providerClicks;

            // Sort services by clicks descending
            const sortedServices = serviceData.services.sort((a, b) => b.serviceOfferingCount - a.serviceOfferingCount);

            return {
                provider: {
                    _id: provider._id,
                    user: {
                        firstName: provider.user?.firstName || '',
                        lastName: provider.user?.lastName || ''
                    },
                    providerProfileCount: providerClicks
                },
                profileClicks: providerClicks,
                serviceClicks: serviceTotalClicks,
                totalClicks: totalClicks,
                serviceCount: serviceData.serviceCount,
                services: sortedServices
            };
        });

        // Sort providers by profile clicks first (\"provider clicks\"), then service clicks
        result.sort((a, b) => {
            const byProfile = (b.profileClicks || 0) - (a.profileClicks || 0);
            if (byProfile !== 0) return byProfile;
            return (b.serviceClicks || 0) - (a.serviceClicks || 0);
        });

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const totalProviders = result.length;
        const totalPages = Math.max(Math.ceil(totalProviders / limit), 1);
        const paginatedResult = result.slice(skip, skip + limit);

        return res.status(200).json({
            success: true,
            data: paginatedResult,
            pagination: {
                currentPage: page,
                totalPages,
                totalProviders,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit,
            },
        });

    } catch (error) {
        console.error("Error in getProviderClicks controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get all users with pagination/search (admin)
 * @route GET /api/admin/all-users
 * @access Private (Admin)
 */
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = (req.query.search || '').trim();
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } },
                    { role: { $regex: search, $options: 'i' } },
                    { communityCommunName: { $regex: search, $options: 'i' } },
                    { requestedCommunityName: { $regex: search, $options: 'i' } },
                ]
            };
        }

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select('firstName lastName email phoneNumber role profileImage isActive createdAt flatNumber communityCommunName requestedCommunityName isPublicMember communName accountStatus addressLine1 addressLine2 city state zip')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error("Error in getAllUsers controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const adminUserPublicFields = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isActive: user.isActive,
    accountStatus: user.accountStatus,
    profileImage: user.profileImage,
    flatNumber: user.flatNumber,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    state: user.state,
    zip: user.zip,
    communName: user.communName,
    communityCommunName: user.communityCommunName,
    requestedCommunityName: user.requestedCommunityName,
    isPublicMember: user.isPublicMember,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

/**
 * @description Activate/deactivate user (admin)
 * @route PATCH /api/admin/user-status/:userId
 * @access Private (Admin)
 */
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: "isActive must be boolean." });
        }

        if (req.user?._id?.toString() === userId && isActive === false) {
            return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.isActive = isActive;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
            user: adminUserPublicFields(user),
        });
    } catch (error) {
        console.error("Error in updateUserStatus controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get one user's full profile (admin)
 * @route GET /api/admin/users/:userId
 * @access Private (Admin)
 */
const getUserByIdAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.status(200).json({
            success: true,
            user: adminUserPublicFields(user),
        });
    } catch (error) {
        console.error("Error in getUserByIdAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Manually change a member's community (admin)
 * @route PATCH /api/admin/users/:userId/community
 * @body { mode: "listed"|"other"|"clear", communityCommunName?, requestedCommunityName?, accountStatus? }
 * @access Private (Admin)
 */
const updateUserCommunityAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const mode = String(req.body?.mode || "listed").trim().toLowerCase();
        const accountStatusRaw = req.body?.accountStatus;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.role === "secretary") {
            return res.status(400).json({
                success: false,
                message: "Secretary community is defined by their Commun name. Edit the secretary account instead.",
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Admin accounts are not linked to a community.",
            });
        }

        if (!["listed", "other", "clear"].includes(mode)) {
            return res.status(400).json({
                success: false,
                message: 'mode must be "listed", "other", or "clear".',
            });
        }

        if (mode === "listed") {
            const cn = normalizeCommunName(req.body?.communityCommunName);
            if (!isValidCommunName(cn)) {
                return res.status(400).json({
                    success: false,
                    message: "Please choose a valid Commun community.",
                });
            }
            const secretary = await User.findOne({
                role: "secretary",
                isActive: true,
                communName: cn,
            }).select("_id");
            if (!secretary) {
                return res.status(400).json({
                    success: false,
                    message: "No active secretary found for that community.",
                });
            }
            user.communityCommunName = cn;
            user.isPublicMember = false;
        } else if (mode === "other") {
            const requested = String(req.body?.requestedCommunityName || "").trim();
            user.communityCommunName = "";
            user.isPublicMember = true;
            user.requestedCommunityName = requested;
        } else {
            user.communityCommunName = "";
            user.isPublicMember = false;
            user.requestedCommunityName = "";
        }

        if (accountStatusRaw !== undefined && accountStatusRaw !== null && accountStatusRaw !== "") {
            const nextStatus = String(accountStatusRaw).trim().toLowerCase();
            if (!["pending", "approved", "rejected"].includes(nextStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "accountStatus must be pending, approved, or rejected.",
                });
            }
            user.accountStatus = nextStatus;
        } else if (mode === "listed") {
            // Admin override — member can use the community immediately.
            user.accountStatus = "approved";
        } else if (mode === "other") {
            user.accountStatus = "approved";
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User community updated successfully.",
            user: adminUserPublicFields(user),
        });
    } catch (error) {
        console.error("Error in updateUserCommunityAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description List all secretary-role users (admin)
 * @route GET /api/admin/secretaries
 */
const getSecretaries = async (req, res) => {
    try {
        const secretaries = await User.find({ role: "secretary" })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: { secretaries }
        });
    } catch (error) {
        console.error("Error in getSecretaries:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update a secretary's details (admin)
 * @route PATCH /api/admin/secretaries/:userId
 * @body { email?: string, firstName?: string, lastName?: string }
 */
const updateSecretaryDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const emailRaw = req.body?.email;
        const firstNameRaw = req.body?.firstName;
        const lastNameRaw = req.body?.lastName;

        const secretary = await User.findById(userId);
        if (!secretary) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (secretary.role !== "secretary") {
            return res.status(400).json({ success: false, message: "This user is not a secretary." });
        }

        if (emailRaw !== undefined) {
            const nextEmail = String(emailRaw || "").trim().toLowerCase();
            if (!nextEmail) {
                return res.status(400).json({ success: false, message: "Email is required." });
            }
            const emailTaken = await User.findOne({ email: nextEmail, _id: { $ne: secretary._id } }).select("_id");
            if (emailTaken) {
                return res.status(409).json({ success: false, message: "Email is already registered." });
            }
            secretary.email = nextEmail;
        }

        if (firstNameRaw !== undefined) {
            const nextFirst = String(firstNameRaw || "").trim();
            if (!nextFirst) {
                return res.status(400).json({ success: false, message: "First name is required." });
            }
            secretary.firstName = nextFirst;
        }

        if (lastNameRaw !== undefined) {
            const nextLast = String(lastNameRaw || "").trim();
            if (!nextLast) {
                return res.status(400).json({ success: false, message: "Last name is required." });
            }
            secretary.lastName = nextLast;
        }

        await secretary.save();

        const safe = secretary.toObject();
        delete safe.password;

        return res.status(200).json({
            success: true,
            message: "Secretary updated.",
            data: { user: safe },
        });
    } catch (error) {
        console.error("Error in updateSecretaryDetails:", error.message);
        if (error?.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "Email is already registered." });
        }
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

/**
 * @description Onboard a new secretary account (admin)
 * @route POST /api/admin/secretaries
 * @body firstName, lastName, phoneNumber, email, communName, password
 */
const createSecretary = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email, communName, password } = req.body;

        const fn = String(firstName || "").trim();
        const ln = String(lastName || "").trim();
        const phone = String(phoneNumber || "").trim();
        const em = String(email || "").trim().toLowerCase();
        const cnRaw = normalizeCommunName(communName);
        const pwd = String(password || "");

        if (!fn || !ln || !phone || !em || !cnRaw || !pwd) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: first name, last name, phone, email, Commun name, and password."
            });
        }

        if (pwd.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        if (!isValidCommunName(cnRaw)) {
            return res.status(400).json({
                success: false,
                message: "Commun name must be 2–40 characters, start and end with a letter or number; hyphens and underscores allowed in between."
            });
        }

        const emailTaken = await User.findOne({ email: em });
        if (emailTaken) {
            return res.status(409).json({ success: false, message: "Email is already registered." });
        }

        const nameTaken = await User.findOne({ communName: cnRaw });
        if (nameTaken) {
            return res.status(409).json({ success: false, message: "This Commun name is already taken." });
        }

        const hashedPassword = await bcrypt.hash(pwd, 10);

        const user = await User.create({
            firstName: fn,
            lastName: ln,
            phoneNumber: phone,
            email: em,
            communName: cnRaw,
            password: hashedPassword,
            role: "secretary",
            accountStatus: "approved",
        });

        const safe = user.toObject();
        delete safe.password;

        return res.status(201).json({
            success: true,
            message: "Secretary onboarded successfully.",
            user: safe
        });
    } catch (error) {
        console.error("Error in createSecretary:", error.message);
        if (error.code === 11000) {
            const key = error.keyPattern?.email ? "email" : error.keyPattern?.communName ? "Commun name" : "field";
            return res.status(409).json({
                success: false,
                message: `That ${key} is already in use.`
            });
        }
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
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
    setServiceCoverImage,
    deleteServicePDF,
    getCategoryClicks,
    getProviderClicks,
    getAllUsers,
    updateUserStatus,
    getUserByIdAdmin,
    updateUserCommunityAdmin,
    getAllCategoriesAdmin,
    createCategoryAdmin,
    updateCategoryAdmin,
    updateCategoryStatusAdmin,
    getSecretaries,
    updateSecretaryDetails,
    createSecretary
};