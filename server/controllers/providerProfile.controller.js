import User from "../models/user.model.js";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import { validateCategorySelection } from "../utils/categoryValidation.js";
import Booking from "../models/booking.model.js"; // <-- You need to import Booking model here for dashboard stats
import Comment from "../models/comment.model.js";
import {
    S3_FOLDERS,
    createPresignedUploadUrl,
    deleteFromS3,
    uploadBufferToS3,
} from "../utils/s3Upload.js";
import { sendSecretaryProviderApplicationEmail } from "../utils/email.js";

/** Public provider listings only include users approved by secretary (legacy: missing status = approved). */
const USER_PUBLIC_POPULATE_MATCH = {
    isActive: { $ne: false },
    $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
};

/**
 * @description Create a presigned S3 upload URL for direct browser uploads
 * @route POST /api/provider-profile/s3-presign
 * @access Private (Auth User)
 */
const getS3PresignedUpload = async (req, res) => {
    try {
        const filename = String(req.body?.filename || "upload").trim();
        const contentType = String(req.body?.contentType || "application/octet-stream").trim();

        const presigned = await createPresignedUploadUrl({
            folder: S3_FOLDERS.SERVICE,
            contentType,
            filename,
        });

        return res.status(200).json({
            success: true,
            uploadUrl: presigned.uploadUrl,
            publicUrl: presigned.publicUrl,
            public_id: presigned.public_id,
        });
    } catch (error) {
        console.error(`[${req?.requestId || "no-rid"}] Error in getS3PresignedUpload:`, error?.message || error);
        const isDev = process.env.NODE_ENV !== "production";
        return res.status(500).json({
            success: false,
            message: isDev
                ? `Upload setup failed: ${error?.message || "unknown error"}`
                : "Unable to prepare upload. Please try again.",
        });
    }
};

/**
 * @description Update a provider's basic profile (bio, experience)
 * @route PUT /api/provider-profile/
 * @access Private (Provider)
 */
 const updateProviderProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bio } = req.body; // no experience
        const profile = await ProviderProfile.findOneAndUpdate(
            { user: userId },
            { bio },
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            profile
        });
    } catch (error) {
        console.error("Error in updateProviderProfile:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};

// --- Service Offering Controllers ---

/**
 * @description Add a new service offering to a provider's profile
 * @route POST /api/provider-profile/service
 * @access Private (Provider)
 */
 const addServiceOffering = async (req, res) => {
    try {
        const userId = req.user._id;
        const { servicename, serviceCategory, subCategories, keywords, description, experience } = req.body;

        // When using upload.any(), req.files is an array
        const filesArray = req.files || [];
        
        // Filter files by fieldname
        const images = filesArray.filter(file => file.fieldname === 'portfolioImages');
        const pdfs = filesArray.filter(file => file.fieldname === 'portfolioPDFs');
        
        // Work images / PDFs are optional; UI will show a default logo when none provided.
        
        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // 1. Upload images to S3
        const imageUploadPromises = images.map(file => uploadBufferToS3(file));
        let portfolioImages = await Promise.all(imageUploadPromises);
        if (!portfolioImages.length) {
            portfolioImages = [{ url: "/CommuN-logo.png" }];
        }
        
        // 2. Upload PDFs to S3
        const pdfUploadPromises = pdfs.map(file => uploadBufferToS3(file));
        const portfolioPDFs = await Promise.all(pdfUploadPromises); 

        // Parse subCategories if it's a JSON string
        let parsedSubCategories = subCategories;
        if (subCategories && typeof subCategories === 'string') {
            try {
                parsedSubCategories = JSON.parse(subCategories);
            } catch (e) {
                // If parsing fails, treat as single value
                parsedSubCategories = [subCategories];
            }
        }
        
        // Parse keywords if it's a JSON string
        let parsedKeywords = keywords;
        if (keywords && typeof keywords === 'string') {
            try {
                parsedKeywords = JSON.parse(keywords);
            } catch (e) {
                // If parsing fails, treat as single value
                parsedKeywords = [keywords];
            }
        }

        const nextSubCategories = Array.isArray(parsedSubCategories)
            ? parsedSubCategories
            : (parsedSubCategories ? [parsedSubCategories] : []);
        const nextKeywords = Array.isArray(parsedKeywords)
            ? parsedKeywords
            : (parsedKeywords ? [parsedKeywords] : []);

        // Enforce DB-driven category/subcategory/specialization validation
        const validated = await validateCategorySelection({
            serviceCategory,
            subCategories: nextSubCategories,
            keywords: nextKeywords,
        });

        // 3. Create the service offering document
        const newService = new ServiceOffering({
            provider: profile._id,
            servicename,
            serviceCategory: validated.serviceCategory,
            subCategories: validated.subCategories,
            keywords: validated.keywords,
            description,
            portfolioImages,
            portfolioPDFs,
        });
        if (experience !== undefined && experience !== "" && experience !== null) {
            newService.experience = parseInt(experience, 10);
        }
        
        // 4. Save the new service offering (triggers pre-save validation)
        await newService.save();

        return res.status(201).json({
            success: true,
            message: "Service added successfully.",
            service: newService
        });

    } catch (error) {
        console.error("Error in addServiceOffering:", error.message);
        // This will catch Mongoose validation errors (like invalid subcategory/keyword)
        return res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @description Delete a service offering and its associated images
 * @route DELETE /api/provider-profile/service/:serviceId
 * @access Private (Provider)
 */
 const deleteServiceOffering = async (req, res) => {
    try {
        const userId = req.user._id;
        const { serviceId } = req.params;

        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Verify ownership: only the provider who owns the service can delete it
        if (service.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this service." });
        }

        // 1. Delete associated images from S3
        const imageDeletePromises = (service.portfolioImages || [])
            .filter((img) => img?.public_id)
            .map((img) => deleteFromS3(img.public_id));
        await Promise.all(imageDeletePromises);
        
        // 2. Delete associated PDFs from S3
        const pdfDeletePromises = (service.portfolioPDFs || [])
            .filter((pdf) => pdf?.public_id)
            .map((pdf) => deleteFromS3(pdf.public_id));
        await Promise.all(pdfDeletePromises);
        
        // 3. Delete the service offering from MongoDB
        await ServiceOffering.findByIdAndDelete(serviceId);

        return res.status(200).json({ success: true, message: "Service deleted successfully." });
        
    } catch (error) {
        console.error("Error in deleteServiceOffering:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @description Get all dashboard statistics for the logged-in provider
 * @route GET /api/provider-profile/dashboard/stats
 * @access Private (Provider)
 */
const getProviderDashboardStats = async (req, res) => {
    try {
        const providerUserId = req.user._id;

        // 1. Find the provider's profile along with their service offerings
        const providerProfile = await ProviderProfile.findOne({ user: providerUserId })
            .populate('serviceOfferings', '_id serviceCategory serviceOfferingCount');

        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const providerProfileId = providerProfile._id;
        const serviceIds = providerProfile.serviceOfferings.map((service) => service._id);

        // 2. Gather booking stats, rating stats, service engagement, and booking lists in parallel
        const now = new Date();
        const [bookingStats, recentBookings, upcomingBookings, ratingStats, serviceClickStats] = await Promise.all([
            Booking.aggregate([
                { $match: { provider: providerProfileId } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            Booking.find({ provider: providerProfileId })
                .populate('customer', 'firstName lastName profileImage addressLine1 addressLine2 city state zip')
                .sort({ createdAt: -1 })
                .limit(5),
            Booking.find({
                provider: providerProfileId,
                scheduledDate: { $gte: now }
            })
                .populate('customer', 'firstName lastName profileImage addressLine1 addressLine2 city state zip')
                .sort({ scheduledDate: 1 })
                .limit(5),
            serviceIds.length > 0
                ? Comment.aggregate([
                    { $match: { serviceOffering: { $in: serviceIds } } },
                    {
                        $group: {
                            _id: null,
                            averageRating: { $avg: "$rating" },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ])
                : []
            ,
            ServiceOffering.aggregate([
                { $match: { provider: providerProfileId } },
                {
                    $group: {
                        _id: null,
                        totalServiceClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } }
                    }
                }
            ])
        ]);

        // 3. Normalize status counts
        const statusCounts = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0,
            cancelled: 0
        };

        let totalBookings = 0;
        bookingStats.forEach((stat) => {
            if (statusCounts.hasOwnProperty(stat._id)) {
                statusCounts[stat._id] = stat.count;
            }
            totalBookings += stat.count;
        });

        // 4. Compile rating stats
        let averageRating = 0;
        let totalReviews = 0;

        if (ratingStats.length > 0 && ratingStats[0].totalReviews > 0) {
            averageRating = parseFloat(ratingStats[0].averageRating.toFixed(1));
            totalReviews = ratingStats[0].totalReviews;
        }

        // 5. Calculate profile/service engagement stats
        const totalServiceClicks = serviceClickStats.length > 0
            ? serviceClickStats[0].totalServiceClicks || 0
            : 0;

        // 6. Respond with aggregated dashboard data
        return res.status(200).json({
            success: true,
            data: {
                totalBookings,
                statusCounts,
                totalServices: providerProfile.serviceOfferings.length,
                averageRating,
                totalReviews,
                profileViews: providerProfile.providerProfileCount || 0,
                serviceClicks: totalServiceClicks,
                serviceClickDetails: providerProfile.serviceOfferings.map(service => ({
                    id: service._id,
                    serviceCategory: service.serviceCategory,
                    clicks: service.serviceOfferingCount || 0
                })),
                recentBookings,
                upcomingBookings,
            }
        });

    } catch (error) {
        console.error("Error in getProviderDashboardStats controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// --- Public Fetching Controllers ---

/**
 * @description Get all approved providers (for the public list page)
 * @route GET /api/provider-profile/
 * @access Public
 */
const getAllProviders = async (req, res) => {
    try {
        const pageParam = parseInt(req.query.page, 10);
        const limitParam = parseInt(req.query.limit, 10);
        const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 12;
        const skip = (page - 1) * limit;

        // NOTE: Providers page doesn't need per-service ratings. Services page uses a separate paginated endpoint.
        const userMatch = {
            isActive: { $ne: false },
            $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
        };

        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $match: userMatch },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                profileImage: 1,
                                phoneNumber: 1,
                                addressLine1: 1,
                                addressLine2: 1,
                                city: 1,
                                state: 1,
                                zip: 1,
                                isActive: 1,
                                accountStatus: 1,
                                communName: 1,
                                communityCommunName: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "serviceofferings",
                    localField: "_id",
                    foreignField: "provider",
                    as: "serviceOfferings",
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    meta: [{ $count: "total" }],
                },
            },
        ];

        const [result] = await ProviderProfile.aggregate(pipeline);
        const providers = result?.data || [];
        const total = result?.meta?.[0]?.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return res.status(200).json({
            success: true,
            providers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Error in getAllProviders:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get top providers ranked by the sum of serviceOfferingCount across their services
 * @route GET /api/provider-profile/top-providers?limit=3
 * @access Public
 */
const getTopProvidersByServiceClicks = async (req, res) => {
    try {
        const limitParam = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitParam) && limitParam > 0
            ? Math.min(limitParam, 12)
            : 3;

        const aggregatedProviders = await ServiceOffering.aggregate([
            {
                $group: {
                    _id: "$provider",
                    totalServiceClicks: { $sum: { $ifNull: ["$serviceOfferingCount", 0] } },
                    serviceCount: { $sum: 1 }
                }
            },
            { $sort: { totalServiceClicks: -1, serviceCount: -1 } },
            { $limit: limit }
            
        ]);

        let providersResponse = [];

        if (aggregatedProviders.length > 0) {
            const providerIds = aggregatedProviders.map((item) => item._id);
            const providers = await ProviderProfile.find({ _id: { $in: providerIds } })
                .populate({
                    path: 'user',
                    select: 'firstName lastName profileImage addressLine1 addressLine2 city state zip isActive accountStatus',
                    match: USER_PUBLIC_POPULATE_MATCH,
                })
                .select('user providerProfileCount');

            const providerMap = new Map(
                providers.map((provider) => [provider._id.toString(), provider])
            );

            providersResponse = aggregatedProviders
                .map((item) => {
                    const provider = providerMap.get(item._id.toString());
                    if (!provider || !provider.user) {
                        return null;
                    }
                    return {
                        _id: provider._id,
                        name: provider.user.firstName && provider.user.lastName 
                            ? `${provider.user.firstName} ${provider.user.lastName}` 
                            : provider.user.firstName || '',
                        avatar: provider.user.profileImage || "",
                        totalServiceClicks: item.totalServiceClicks || 0,
                        serviceCount: item.serviceCount || 0,
                        providerProfileCount: provider.providerProfileCount || 0
                    };
                })
                .filter(Boolean);
        } else {
            // Fallback: use provider profile count ordering if no services have clicks yet
            const fallbackProviders = await ProviderProfile.find({})
                .populate({
                    path: 'user',
                    select: 'firstName lastName profileImage addressLine1 addressLine2 city state zip isActive accountStatus',
                    match: USER_PUBLIC_POPULATE_MATCH,
                })
                .sort({ providerProfileCount: -1 })
                .limit(limit)
                .select('user providerProfileCount serviceOfferings');

            providersResponse = fallbackProviders
                .filter((provider) => provider.user)
                .map((provider) => ({
                    _id: provider._id,
                    name: provider.user.firstName && provider.user.lastName 
                        ? `${provider.user.firstName} ${provider.user.lastName}` 
                        : provider.user.firstName || '',
                    avatar: provider.user.profileImage || "",
                    totalServiceClicks: 0,
                    serviceCount: Array.isArray(provider.serviceOfferings) ? provider.serviceOfferings.length : 0,
                    providerProfileCount: provider.providerProfileCount || 0
                }));
        }

        return res.status(200).json({
            success: true,
            providers: providersResponse
        });
    } catch (error) {
        console.error("Error in getTopProvidersByServiceClicks:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get one provider's full details by their PROFILE ID (for detail page)
 * @route GET /api/provider-profile/:id
 * @access Public
 */
const getProviderById = async (req, res) => {
    try {
        const provider = await ProviderProfile.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'firstName lastName profileImage phoneNumber addressLine1 addressLine2 city state zip createdAt isActive accountStatus communName communityCommunName',
                match: USER_PUBLIC_POPULATE_MATCH,
            }) // hide deactivated / pending from public
            .populate('serviceOfferings'); // Get all their service offerings

        if (!provider || !provider.user) {
            return res.status(404).json({ success: false, message: "Provider not found." });
        }
        
        // Get all service offering IDs for this provider
        const serviceIds = provider.serviceOfferings.map(service => service._id);
        
        // Calculate average rating and total reviews across all services
        let averageRating = 0;
        let totalReviews = 0;
        
        if (serviceIds.length > 0) {
            const ratingStats = await Comment.aggregate([
                {
                    $match: {
                        serviceOffering: { $in: serviceIds }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);
            
            if (ratingStats.length > 0 && ratingStats[0].totalReviews > 0) {
                averageRating = parseFloat(ratingStats[0].averageRating.toFixed(1));
                totalReviews = ratingStats[0].totalReviews;
            }
        }
        
        return res.status(200).json({
            success: true,
            provider: {
                ...provider.toObject(),
                stats: {
                    averageRating,
                    totalReviews
                }
            }
        });
    } catch (error) {
        console.error("Error in getProviderById:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get current user's provider profile with services
 * @route GET /api/provider-profile/my-profile
 * @access Private (Provider)
 */
const getMyProviderProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const provider = await ProviderProfile.findOne({ user: userId })
            .populate('user', 'firstName lastName email phoneNumber addressLine1 addressLine2 city state zip profileImage')
            .populate('serviceOfferings');

        if (!provider) {
            return res.status(404).json({ 
                success: false, 
                message: "Provider profile not found." 
            });
        }
        
        return res.status(200).json({
            success: true,
            provider
        });
    } catch (error) {
        console.error("Error in getMyProviderProfile:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Become a provider with multiple services in one submission
 * @route POST /api/provider-profile/become-provider-multi
 * @access Private (Auth User)
 */
const becomeProviderWithServices = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Parse services from body (expecting JSON string or object)
        let services;
        if (typeof req.body.services === 'string') {
            try {
                services = JSON.parse(req.body.services);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid form data. Please refresh the page and try again.",
                });
            }
        } else {
            services = req.body.services;
        }

        // Validate that services array exists and is not empty
        if (!services || !Array.isArray(services) || services.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "At least one service is required." 
            });
        }

        const authUser = await User.findById(userId);
        if (!authUser) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        if (!authUser.communityCommunName) {
            return res.status(403).json({
                success: false,
                message: "You must be assigned to a Commun community before becoming a provider.",
            });
        }

        const existingProfile = await ProviderProfile.findOne({ user: userId });
        if (existingProfile) {
            const acctExisting = authUser.accountStatus || "approved";
            if (acctExisting === "pending") {
                return res.status(200).json({
                    success: true,
                    pendingApproval: true,
                    message: "Your provider application is waiting for secretary approval.",
                    profile: existingProfile,
                    user: {
                        _id: userId,
                        role: authUser.role,
                        accountStatus: acctExisting,
                    },
                });
            }
            await User.findByIdAndUpdate(userId, { role: "provider" });
            return res.status(200).json({
                success: true,
                message: "You are already a provider.",
                profile: existingProfile,
                user: { _id: userId, role: "provider" },
            });
        }

        const acct = authUser.accountStatus || "approved";
        if (acct !== "approved") {
            return res.status(403).json({
                success: false,
                message:
                    acct === "pending"
                        ? "Your account is not approved yet. Please wait for a secretary to approve your registration."
                        : "You cannot apply as a provider with this account.",
            });
        }
        if (authUser.role !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Only approved customer accounts can submit a provider application.",
            });
        }

        // Validate each service has required fields
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            if (!service.servicename || !service.servicename.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: Service name is required.` 
                });
            }
            if (!service.category) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: Category is required.` 
                });
            }
            if (!service.subCategories || service.subCategories.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: At least one sub-category is required.` 
                });
            }
            if (!service.keywords || service.keywords.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: At least one keyword is required.` 
                });
            }
            if (!service.bio || !service.bio.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: Bio/Description is required.` 
                });
            }
        }

        // Calculate average experience (only include services with experience values)
        const servicesWithExperience = services.filter(s => s.experience !== undefined && s.experience !== '' && s.experience !== null);
        const avgExperience = servicesWithExperience.length > 0
            ? Math.round(
                servicesWithExperience.reduce((sum, s) => sum + parseInt(s.experience || 0), 0) / servicesWithExperience.length
            )
            : 0;
        
        // Get provider bio from request body (not from first service)
        const providerBioFromRequest = req.body.providerBio;
        
        if (!providerBioFromRequest || !providerBioFromRequest.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Provider bio is required." 
            });
        }

        const newProfile = await ProviderProfile.create({
            user: userId,
            bio: providerBioFromRequest.substring(0, 500), // Limit to 500 characters
            experience: avgExperience
        });

        // Create all service offerings
        const createdServices = [];
        // req.files is an array when using upload.any()
        const filesArray = req.files || [];
        
        // Group files by service index and type (images vs PDFs)
        const imagesByService = {};
        const pdfsByService = {};
        filesArray.forEach(file => {
            // Extract service index and file type from fieldname (e.g., "service_0_images", "service_0_pdfs")
            const match = file.fieldname.match(/service_(\d+)_(images|pdfs)/);
            if (match) {
                const index = parseInt(match[1]);
                const fileType = match[2];
                
                if (fileType === 'images') {
                    if (!imagesByService[index]) {
                        imagesByService[index] = [];
                    }
                    imagesByService[index].push(file);
                } else if (fileType === 'pdfs') {
                    if (!pdfsByService[index]) {
                        pdfsByService[index] = [];
                    }
                    pdfsByService[index].push(file);
                }
            }
        });
        
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            
            try {
                // Get images and PDFs for this service index
                const serviceImages = imagesByService[i] || [];
                const servicePDFs = pdfsByService[i] || [];

                // Work images/PDFs are optional

                // Upload images to S3
                const imageUploadPromises = serviceImages.map(file => uploadBufferToS3(file));
                let portfolioImages = await Promise.all(imageUploadPromises);
                if (!portfolioImages.length) {
                    portfolioImages = [{ url: "/CommuN-logo.png" }];
                }
                
                // Upload PDFs to S3
                const pdfUploadPromises = servicePDFs.map(file => uploadBufferToS3(file));
                const portfolioPDFs = await Promise.all(pdfUploadPromises);

                // Create the service offering
                const serviceData = {
                    provider: newProfile._id,
                    servicename: service.servicename,
                    serviceCategory: service.category,
                    subCategories: Array.isArray(service.subCategories) 
                        ? service.subCategories 
                        : [service.subCategories],
                    keywords: Array.isArray(service.keywords) 
                        ? service.keywords 
                        : [service.keywords],
                    description: service.bio,
                    portfolioImages: portfolioImages,
                    portfolioPDFs: portfolioPDFs,
                };
                
                // Only set experience if provided
                if (service.experience !== undefined && service.experience !== '' && service.experience !== null) {
                    serviceData.experience = parseInt(service.experience);
                }
                
                const newServiceOffering = new ServiceOffering(serviceData);

                await newServiceOffering.save();
                createdServices.push(newServiceOffering);

            } catch (serviceError) {
                console.error(`Error creating service ${i + 1}:`, serviceError.message);
                // If critical, clean up and return error
                await ProviderProfile.findByIdAndDelete(newProfile._id);
                return res.status(400).json({ 
                    success: false, 
                    message: `Error creating service ${i + 1}: ${serviceError.message}` 
                });
            }
        }

        // Check if at least one service was created
        if (createdServices.length === 0) {
            await ProviderProfile.findByIdAndDelete(newProfile._id);
            return res.status(400).json({ 
                success: false, 
                message: "Failed to create any services." 
            });
        }

        await User.findByIdAndUpdate(userId, { role: "provider", accountStatus: "pending" });
        const updatedUser = await User.findById(userId).select(
            "role accountStatus communName communityCommunName firstName lastName email phoneNumber"
        );

        try {
            const cn = updatedUser?.communityCommunName;
            if (cn) {
                const secretary = await User.findOne({
                    role: "secretary",
                    isActive: true,
                    communName: cn,
                }).select("email");
                if (secretary?.email) {
                    const memberName = [updatedUser.firstName, updatedUser.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                    const mailResult = await sendSecretaryProviderApplicationEmail({
                        toEmail: String(secretary.email).trim().toLowerCase(),
                        communityCommunName: cn,
                        memberName: memberName || "Provider applicant",
                        memberEmail: updatedUser.email,
                        memberPhone: updatedUser.phoneNumber,
                    });
                    if (!mailResult?.sent) {
                        console.error(
                            "Secretary provider-application notification was not sent:",
                            mailResult?.reason || "unknown",
                            "to=",
                            secretary.email
                        );
                    }
                } else {
                    console.error("Secretary provider-application notification skipped — no secretary email.", {
                        communName: cn,
                    });
                }
            }
        } catch (mailError) {
            console.error(
                "Secretary provider-application notification failed:",
                mailError?.message || mailError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Application submitted. A secretary will review your provider profile shortly.",
            pendingApproval: true,
            profile: newProfile,
            services: createdServices,
            user: {
                _id: userId,
                role: updatedUser.role,
                accountStatus: updatedUser.accountStatus,
                communName: updatedUser.communName,
                communityCommunName: updatedUser.communityCommunName,
            },
        });

    } catch (error) {
        console.error(`[${req?.requestId || "no-rid"}] Error in becomeProviderWithServices:`, error?.message || error);
        return res.status(500).json({ 
            success: false, 
            message: "Unable to submit right now. Please try again in a moment." 
        });
    }
};

/**
 * @description Update an existing service offering
 * @route PUT /api/provider-profile/service/:serviceId
 * @access Private (Provider)
 */
const updateServiceOffering = async (req, res) => {
    try {
        const userId = req.user._id;
        const { serviceId } = req.params;
        const { servicename, serviceCategory, subCategories, keywords, description, experience } = req.body;

        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Verify ownership
        if (service.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "You are not authorized to update this service." 
            });
        }

        // Capture original taxonomy values before mutating, so pre-existing (legacy)
        // entries can be grandfathered during validation.
        const originalCategory = service.serviceCategory;
        const originalSubCategories = [...(service.subCategories || [])];
        const originalKeywords = [...(service.keywords || [])];

        // Update service fields
        if (servicename !== undefined) service.servicename = servicename;
        if (serviceCategory) service.serviceCategory = serviceCategory;
        
        // Parse subCategories if it's a JSON string
        if (subCategories) {
            let parsedSubCategories = subCategories;
            if (typeof subCategories === 'string') {
                try {
                    parsedSubCategories = JSON.parse(subCategories);
                } catch (e) {
                    // If parsing fails, treat as single value
                    parsedSubCategories = [subCategories];
                }
            }
            service.subCategories = Array.isArray(parsedSubCategories) ? parsedSubCategories : [parsedSubCategories];
        }
        
        // Parse keywords if it's a JSON string
        if (keywords) {
            let parsedKeywords = keywords;
            if (typeof keywords === 'string') {
                try {
                    parsedKeywords = JSON.parse(keywords);
                } catch (e) {
                    // If parsing fails, treat as single value
                    parsedKeywords = [keywords];
                }
            }
            service.keywords = Array.isArray(parsedKeywords) ? parsedKeywords : [parsedKeywords];
        }

        // Enforce DB-driven category/subcategory/specialization validation using the final values to be saved
        const categoryChanged =
            String(service.serviceCategory || "") !== String(originalCategory || "");
        await validateCategorySelection({
            serviceCategory: service.serviceCategory,
            subCategories: service.subCategories || [],
            keywords: service.keywords || [],
            existingSubCategories: categoryChanged ? [] : originalSubCategories,
            existingKeywords: categoryChanged ? [] : originalKeywords,
        });
        
        if (description) service.description = description;
        // Only update experience if provided and not empty
        if (experience !== undefined && experience !== '' && experience !== null) {
            service.experience = parseInt(experience);
        } else if (experience === '' || experience === null) {
            // Allow clearing experience by setting to undefined
            service.experience = undefined;
        }
        // Keep/remove existing portfolio assets if frontend sent latest retained lists.
        // This allows users to delete old images/PDFs during edit/update flows.
        if (req.body.existingImages !== undefined) {
            let retainedImages = [];
            try {
                retainedImages = typeof req.body.existingImages === 'string'
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
            } catch {
                retainedImages = [];
            }

            const retainedImageIds = new Set(
                (Array.isArray(retainedImages) ? retainedImages : [])
                    .map((img) => img?.public_id)
                    .filter(Boolean)
            );

            const imagesToDelete = (service.portfolioImages || []).filter(
                (img) => img?.public_id && !retainedImageIds.has(img.public_id)
            );
            await Promise.all(imagesToDelete.map((img) => deleteFromS3(img.public_id)));
            service.portfolioImages = Array.isArray(retainedImages) ? retainedImages : [];
        }

        if (req.body.existingPDFs !== undefined) {
            let retainedPDFs = [];
            try {
                retainedPDFs = typeof req.body.existingPDFs === 'string'
                    ? JSON.parse(req.body.existingPDFs)
                    : req.body.existingPDFs;
            } catch {
                retainedPDFs = [];
            }

            const retainedPDFIds = new Set(
                (Array.isArray(retainedPDFs) ? retainedPDFs : [])
                    .map((pdf) => pdf?.public_id)
                    .filter(Boolean)
            );

            const pdfsToDelete = (service.portfolioPDFs || []).filter(
                (pdf) => pdf?.public_id && !retainedPDFIds.has(pdf.public_id)
            );
            await Promise.all(pdfsToDelete.map((pdf) => deleteFromS3(pdf.public_id)));
            service.portfolioPDFs = Array.isArray(retainedPDFs) ? retainedPDFs : [];
        }

        // When using upload.any(), req.files is an array
        const filesArray = req.files || [];
        
        // Filter files by fieldname
        const images = filesArray.filter(file => file.fieldname === 'portfolioImages');
        const pdfs = filesArray.filter(file => file.fieldname === 'portfolioPDFs');
        
        // Handle new images if uploaded
        if (images.length > 0) {
            // If the service currently only has the default logo placeholder, remove it
            service.portfolioImages = (service.portfolioImages || []).filter(
                (img) => !(img && !img.public_id && img.url === "/CommuN-logo.png")
            );

            const imageUploadPromises = images.map(file => uploadBufferToS3(file));
            const newImages = await Promise.all(imageUploadPromises);
            
            // Add new images to existing ones
            service.portfolioImages = [...service.portfolioImages, ...newImages];
        }
        if (!service.portfolioImages || service.portfolioImages.length === 0) {
            service.portfolioImages = [{ url: "/CommuN-logo.png" }];
        }
        
        // Handle new PDFs if uploaded
        if (pdfs.length > 0) {
            const pdfUploadPromises = pdfs.map(file => uploadBufferToS3(file));
            const newPDFs = await Promise.all(pdfUploadPromises);
            
            // Add new PDFs to existing ones
            service.portfolioPDFs = [...(service.portfolioPDFs || []), ...newPDFs];
        }

        await service.save();

        return res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            service
        });
    } catch (error) {
        console.error("Error in updateServiceOffering:", error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @description Add a new service offering (JSON only, assets already uploaded to S3)
 * @route POST /api/provider-profile/service-json
 * @access Private (Provider)
 */
const addServiceOfferingJson = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            servicename,
            serviceCategory,
            subCategories,
            keywords,
            description,
            experience,
            portfolioImages,
            portfolioPDFs,
        } = req.body || {};

        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const nextSubCategories = Array.isArray(subCategories) ? subCategories : (subCategories ? [subCategories] : []);
        const nextKeywords = Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []);

        const validated = await validateCategorySelection({
            serviceCategory,
            subCategories: nextSubCategories,
            keywords: nextKeywords,
        });

        let nextImages = Array.isArray(portfolioImages) ? portfolioImages : [];
        if (!nextImages.length) nextImages = [{ url: "/CommuN-logo.png" }];
        const nextPDFs = Array.isArray(portfolioPDFs) ? portfolioPDFs : [];

        const newService = new ServiceOffering({
            provider: profile._id,
            servicename,
            serviceCategory: validated.serviceCategory,
            subCategories: validated.subCategories,
            keywords: validated.keywords,
            description,
            portfolioImages: nextImages,
            portfolioPDFs: nextPDFs,
        });
        if (experience !== undefined && experience !== '' && experience !== null) {
            newService.experience = parseInt(experience);
        }

        await newService.save();

        return res.status(201).json({
            success: true,
            message: "Service added successfully.",
            service: newService
        });
    } catch (error) {
        console.error(`[${req?.requestId || "no-rid"}] Error in addServiceOfferingJson:`, error?.message || error);
        return res.status(400).json({ success: false, message: "Unable to create service. Please try again." });
    }
};

/**
 * @description Update a service offering (JSON only, assets already uploaded to S3)
 * @route PUT /api/provider-profile/service-json/:serviceId
 * @access Private (Provider)
 */
const updateServiceOfferingJson = async (req, res) => {
    try {
        const userId = req.user._id;
        const { serviceId } = req.params;
        const {
            servicename,
            serviceCategory,
            subCategories,
            keywords,
            description,
            experience,
            portfolioImages,
            portfolioPDFs,
        } = req.body || {};

        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        const service = await ServiceOffering.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }
        if (service.provider.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this service." });
        }

        // Capture original taxonomy values before mutating, so pre-existing (legacy)
        // entries can be grandfathered during validation.
        const originalCategory = service.serviceCategory;
        const originalSubCategories = [...(service.subCategories || [])];
        const originalKeywords = [...(service.keywords || [])];

        if (servicename !== undefined) service.servicename = servicename;
        if (serviceCategory) service.serviceCategory = serviceCategory;
        if (description !== undefined) service.description = description;

        if (subCategories !== undefined) {
            service.subCategories = Array.isArray(subCategories) ? subCategories : (subCategories ? [subCategories] : []);
        }
        if (keywords !== undefined) {
            service.keywords = Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []);
        }

        const categoryChanged =
            String(service.serviceCategory || "") !== String(originalCategory || "");
        await validateCategorySelection({
            serviceCategory: service.serviceCategory,
            subCategories: service.subCategories || [],
            keywords: service.keywords || [],
            existingSubCategories: categoryChanged ? [] : originalSubCategories,
            existingKeywords: categoryChanged ? [] : originalKeywords,
        });

        if (experience !== undefined) {
            if (experience === '' || experience === null) {
                service.experience = undefined;
            } else {
                service.experience = parseInt(experience);
            }
        }

        // Replace assets from client-provided lists.
        // If user provides real images, drop default placeholder.
        let nextImages = Array.isArray(portfolioImages) ? portfolioImages : [];
        nextImages = nextImages.filter((img) => img && img.url);
        const hasRealImage = nextImages.some((img) => img.public_id);
        if (hasRealImage) {
            nextImages = nextImages.filter((img) => !(img && !img.public_id && img.url === "/CommuN-logo.png"));
        }
        if (!nextImages.length) nextImages = [{ url: "/CommuN-logo.png" }];

        const nextPDFs = Array.isArray(portfolioPDFs) ? portfolioPDFs : [];

        // Cleanup removed S3 assets
        const retainedImageIds = new Set(nextImages.map((img) => img?.public_id).filter(Boolean));
        const imagesToDelete = (service.portfolioImages || []).filter(
            (img) => img?.public_id && !retainedImageIds.has(img.public_id)
        );
        await Promise.all(imagesToDelete.map((img) => deleteFromS3(img.public_id)));

        const retainedPDFIds = new Set(nextPDFs.map((pdf) => pdf?.public_id).filter(Boolean));
        const pdfsToDelete = (service.portfolioPDFs || []).filter(
            (pdf) => pdf?.public_id && !retainedPDFIds.has(pdf.public_id)
        );
        await Promise.all(pdfsToDelete.map((pdf) => deleteFromS3(pdf.public_id)));

        service.portfolioImages = nextImages;
        service.portfolioPDFs = nextPDFs;

        await service.save();

        return res.status(200).json({
            success: true,
            message: "Service updated successfully.",
            service
        });
    } catch (error) {
        console.error(`[${req?.requestId || "no-rid"}] Error in updateServiceOfferingJson:`, error?.message || error);
        return res.status(400).json({ success: false, message: "Unable to update service. Please try again." });
    }
};

/**
 * @description Increment service offering click count
 * @route POST /api/service-offering/:id/increment-count
 * @access Public
 */
const incrementServiceOfferingCount = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await ServiceOffering.findById(id);
        
        if (!service) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }
        
        service.serviceOfferingCount = (service.serviceOfferingCount || 0) + 1;
        await service.save();
        
        return res.status(200).json({
            success: true,
            message: "Count incremented successfully.",
            count: service.serviceOfferingCount
        });
    } catch (error) {
        console.error("Error in incrementServiceOfferingCount:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Increment provider profile click count
 * @route POST /api/provider-profile/:id/increment-count
 * @access Public
 */
const incrementProviderProfileCount = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await ProviderProfile.findById(id);
        
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }
        
        provider.providerProfileCount = (provider.providerProfileCount || 0) + 1;
        await provider.save();
        
        return res.status(200).json({
            success: true,
            message: "Count incremented successfully.",
            count: provider.providerProfileCount
        });
    } catch (error) {
        console.error("Error in incrementProviderProfileCount:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- Export all functions from this file ---
export {
    becomeProviderWithServices,
    getS3PresignedUpload,
    updateProviderProfile,
    addServiceOffering,
    updateServiceOffering,
    deleteServiceOffering,
    addServiceOfferingJson,
    updateServiceOfferingJson,
    getProviderDashboardStats,
    getAllProviders,
    getTopProvidersByServiceClicks,
    getProviderById,
    getMyProviderProfile,
    incrementServiceOfferingCount,
    incrementProviderProfileCount,
};