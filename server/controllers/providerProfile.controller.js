import User from "../models/user.model.js";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import Booking from "../models/booking.model.js"; // <-- You need to import Booking model here for dashboard stats
import Comment from "../models/comment.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// --- (Helper functions for Cloudinary) ---
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "service_offerings" }, // Make sure your Cloudinary folder is set
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


// --- Provider Profile Controllers ---

/**
 * @description Create a basic provider profile (Step 1 of becoming a provider)
 * @route POST /api/provider-profile/become-provider
 * @access Private (Auth User)
 */
 const becomeProvider = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bio } = req.body; // only take bio
        if (!bio) {
            return res.status(400).json({ success: false, message: "Bio is required." });
        }
        const existingProfile = await ProviderProfile.findOne({ user: userId });
        if (existingProfile) {
            return res.status(400).json({ success: false, message: "You are already a provider." });
        }
        const newProfile = await ProviderProfile.create({
            user: userId,
            bio
        });
        await User.findByIdAndUpdate(userId, { role: "provider" });
        return res.status(201).json({
            success: true,
            message: "Congratulations! You are now a provider. Proceed to add your services.",
            profile: newProfile
        });
    } catch (error) {
        console.error("Error in becomeProvider:", error.message);
        return res.status(500).json({ success: false, message: error.message });
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
        const { servicename, serviceCategory, subCategories, keywords, description /* , price */ } = req.body;

        // When using upload.any(), req.files is an array
        const filesArray = req.files || [];
        
        // Filter files by fieldname
        const images = filesArray.filter(file => file.fieldname === 'portfolioImages');
        const pdfs = filesArray.filter(file => file.fieldname === 'portfolioPDFs');
        
        if (images.length === 0 && pdfs.length === 0) {
            return res.status(400).json({ success: false, message: "At least one portfolio image or PDF is required for a service." });
        }
        
        const profile = await ProviderProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // 1. Upload images to Cloudinary
        const imageUploadPromises = images.map(file => uploadBufferToCloudinary(file.buffer));
        const portfolioImages = await Promise.all(imageUploadPromises);
        
        // 2. Upload PDFs to Cloudinary
        const pdfUploadPromises = pdfs.map(file => uploadBufferToCloudinary(file.buffer));
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

        // 3. Create the service offering document
        const newService = new ServiceOffering({
            provider: profile._id,
            servicename,
            serviceCategory,
            // Ensure subCategories and keywords are arrays
            subCategories: Array.isArray(parsedSubCategories) ? parsedSubCategories : (parsedSubCategories ? [parsedSubCategories] : []),
            keywords: Array.isArray(parsedKeywords) ? parsedKeywords : (parsedKeywords ? [parsedKeywords] : []),
            description,
            portfolioImages,
            portfolioPDFs,
            // price: parseFloat(price) || 0
        });
        
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

        // 1. Delete associated images from Cloudinary
        const imageDeletePromises = service.portfolioImages.map(img => deleteFromCloudinary(img.public_id));
        await Promise.all(imageDeletePromises);
        
        // 2. Delete associated PDFs from Cloudinary
        const pdfDeletePromises = service.portfolioPDFs?.map(pdf => deleteFromCloudinary(pdf.public_id)) || [];
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
            .populate('serviceOfferings', '_id serviceCategory /* price */ serviceOfferingCount');

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
                    // price: service.price,
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
        // Find all provider profiles and populate their associated user and service offerings
        const providers = await ProviderProfile.find()
            .populate('user', 'firstName lastName profileImage phoneNumber addressLine1 addressLine2 city state zip') // Get user's public info (name, profile image, phone number)
            .populate('serviceOfferings'); // Get all their service offerings (with images, categories, etc.)
        
        // Get all service offering IDs to calculate ratings
        const allServiceIds = [];
        providers.forEach(provider => {
            if (provider.serviceOfferings && Array.isArray(provider.serviceOfferings)) {
                provider.serviceOfferings.forEach(service => {
                    allServiceIds.push(service._id);
                });
            }
        });

        // Calculate average ratings for all services using aggregation
        let serviceRatingsMap = {};
        if (allServiceIds.length > 0) {
            const ratingStats = await Comment.aggregate([
                {
                    $match: {
                        serviceOffering: { $in: allServiceIds }
                    }
                },
                {
                    $group: {
                        _id: "$serviceOffering",
                        averageRating: { $avg: "$rating" },
                        reviewCount: { $sum: 1 }
                    }
                }
            ]);


            // Convert to map for easy lookup - handle both ObjectId and string IDs
            ratingStats.forEach(stat => {
                const serviceId = stat._id.toString();
                serviceRatingsMap[serviceId] = {
                    averageRating: parseFloat(stat.averageRating.toFixed(2)),
                    reviewCount: stat.reviewCount
                };
            });
            
        }

        // Add ratings to each service offering
        const providersWithRatings = providers.map(provider => {
            const providerObj = provider.toObject();
            if (providerObj.serviceOfferings && Array.isArray(providerObj.serviceOfferings)) {
                providerObj.serviceOfferings = providerObj.serviceOfferings.map(service => {
                    // Ensure service is a plain object
                    const serviceObj = service && typeof service.toObject === 'function' 
                        ? service.toObject() 
                        : service;
                    
                    // Handle both ObjectId and string IDs
                    const serviceId = serviceObj._id 
                        ? (serviceObj._id.toString ? serviceObj._id.toString() : String(serviceObj._id))
                        : null;
                    
                    const ratingData = serviceId && serviceRatingsMap[serviceId] 
                        ? serviceRatingsMap[serviceId] 
                        : { averageRating: 0, reviewCount: 0 };
                    return {
                        ...serviceObj,
                        averageRating: ratingData.averageRating,
                        reviewCount: ratingData.reviewCount
                    };
                });
            }
            return providerObj;
        });
        
        return res.status(200).json({
            success: true,
            providers: providersWithRatings
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
                .populate('user', 'firstName lastName profileImage addressLine1 addressLine2 city state zip')
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
                .populate('user', 'firstName lastName profileImage addressLine1 addressLine2 city state zip')
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
            .populate('user', 'firstName lastName profileImage phoneNumber addressLine1 addressLine2 city state zip createdAt') // Get user's public info
            .populate('serviceOfferings'); // Get all their service offerings

        if (!provider) {
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
            services = JSON.parse(req.body.services);
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

        // Check if user is already a provider
        const existingProfile = await ProviderProfile.findOne({ user: userId });
        if (existingProfile) {  
            return res.status(400).json({ 
                success: false, 
                message: "You are already a provider." 
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
            /* if (service.price === undefined || service.price === '' || service.price === null) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: Price is required.` 
                });
            }
            if (parseFloat(service.price) < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Service ${i + 1}: Price cannot be negative.` 
                });
            } */
        }

        // For multi-service, we'll need to handle images differently
        // Images need to be mapped to the correct service index
        // Since the frontend uploads preview URLs, we'll need to handle actual file uploads
        
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

                if (serviceImages.length === 0 && servicePDFs.length === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Service ${i + 1}: Please upload at least one image or PDF.` 
                    });
                }

                // Upload images to Cloudinary
                const imageUploadPromises = serviceImages.map(file => uploadBufferToCloudinary(file.buffer));
                const portfolioImages = await Promise.all(imageUploadPromises);
                
                // Upload PDFs to Cloudinary
                const pdfUploadPromises = servicePDFs.map(file => uploadBufferToCloudinary(file.buffer));
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
                    // price: parseFloat(service.price) || 0
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

        // Update user role to provider
        await User.findByIdAndUpdate(userId, { role: "provider" });

        return res.status(201).json({
            success: true,
            message: `Congratulations! You are now a provider`,
            profile: newProfile,
            services: createdServices
        });

    } catch (error) {
        console.error("Error in becomeProviderWithServices:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: error.message 
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
        const { servicename, serviceCategory, subCategories, keywords, description, experience /* , price */ } = req.body;

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
        
        if (description) service.description = description;
        // Only update experience if provided and not empty
        if (experience !== undefined && experience !== '' && experience !== null) {
            service.experience = parseInt(experience);
        } else if (experience === '' || experience === null) {
            // Allow clearing experience by setting to undefined
            service.experience = undefined;
        }
        // if (price !== undefined) service.price = parseFloat(price);

        // When using upload.any(), req.files is an array
        const filesArray = req.files || [];
        
        // Filter files by fieldname
        const images = filesArray.filter(file => file.fieldname === 'portfolioImages');
        const pdfs = filesArray.filter(file => file.fieldname === 'portfolioPDFs');
        
        // Handle new images if uploaded
        if (images.length > 0) {
            const imageUploadPromises = images.map(file => uploadBufferToCloudinary(file.buffer));
            const newImages = await Promise.all(imageUploadPromises);
            
            // Add new images to existing ones
            service.portfolioImages = [...service.portfolioImages, ...newImages];
        }
        
        // Handle new PDFs if uploaded
        if (pdfs.length > 0) {
            const pdfUploadPromises = pdfs.map(file => uploadBufferToCloudinary(file.buffer));
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
    becomeProvider,
    becomeProviderWithServices,
    updateProviderProfile,
    addServiceOffering,
    updateServiceOffering,
    deleteServiceOffering,
    getProviderDashboardStats,
    getAllProviders,
    getTopProvidersByServiceClicks,
    getProviderById,
    getMyProviderProfile,
    incrementServiceOfferingCount,
    incrementProviderProfileCount,
};