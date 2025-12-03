import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";

/**
 * @description Create a new comment for a service offering
 * @route POST /api/comments/create-comment/:serviceId (This ID is the ServiceOffering ID)
 * @access Private (Any logged-in user)
 */
const createComment = async (req, res) => {
    try {
        // This ID is the SERVICE OFFERING ID
        const { serviceId } = req.params; 
        const { comment, rating } = req.body;
        const customerId = req.user._id; // This is the customer's USER ID

        if (!comment) {
            return res.status(400).json({ success: false, message: "Comment text is required." });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating is required and must be between 1 and 5." });
        }

        // 1. Verify the service offering exists
        const serviceOffering = await ServiceOffering.findById(serviceId);
        if (!serviceOffering) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // 2. Prevent a user from commenting on their own service (via owning provider profile)
        const owningProviderProfile = await ProviderProfile.findById(serviceOffering.provider);
        if (owningProviderProfile && owningProviderProfile.user.toString() === customerId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot comment on your own service." });
        }

        // 3. Check if the customer has already commented on this service
        const existingComment = await Comment.findOne({
            serviceOffering: serviceId,
            customer: customerId
        });
        if (existingComment) {
            return res.status(400).json({ success: false, message: "You have already reviewed this service. You can only leave one review per service." });
        }

        // 4. Create the new comment associated with the service offering
        const newComment = await Comment.create({
            serviceOffering: serviceId,
            provider: serviceOffering.provider, // optional legacy linkage
            customer: customerId,
            comment,
            rating: parseInt(rating)
        });

        return res.status(201).json({
            success: true,
            message: "Comment posted successfully.",
            comment: newComment
        });

    } catch (error) {
        console.error("Error in createComment controller:", error.message);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get all comments for a specific service offering
 * @route GET /api/comments/get-comments/:serviceId (This ID is the ServiceOffering ID)
 * @access Public
 */

const getCommentsForService = async (req, res) => {
    try {
        // This ID is the SERVICE OFFERING ID
        const { serviceId } = req.params; 

        // 1. Find all comments where 'serviceOffering' matches the ServiceOffering ID
        const comments = await Comment.find({ serviceOffering: serviceId })
            .populate('customer', 'name profileImage') // Get commenter's name and image
            .populate('provider', 'user') // Get provider info for ownership checking
            .populate({
                path: 'replyBy',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName profileImage'
                }
            }) // Get reply author's info
            .sort({ createdAt: -1 }); // Show newest comments first

        // Also get the service offering to include provider info
        const serviceOffering = await ServiceOffering.findById(serviceId)
            .populate({
                path: 'provider',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName profileImage _id'
                }
            });

        return res.status(200).json({
            success: true,
            comments,
            serviceProvider: serviceOffering?.provider || null
        });

    } catch (error) {
        console.error("Error in getCommentsForProvider controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update an existing comment
 * @route PUT /api/comments/update-comment/:commentId
 * @access Private (Customer who wrote it)
 */
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment, rating } = req.body;
        const customerId = req.user._id;

        if (!comment) {
            return res.status(400).json({ success: false, message: "Comment text is required." });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating is required and must be between 1 and 5." });
        }

        const existingComment = await Comment.findById(commentId);
        if (!existingComment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Check if the user is the author
        if (existingComment.customer.toString() !== customerId.toString()) {
            return res.status(403).json({ success: false, message: "You can only update your own comments." });
        }
        
        existingComment.comment = comment;
        existingComment.rating = parseInt(rating);
        const updatedComment = await existingComment.save();

        // Populate all necessary fields for response
        await updatedComment.populate('customer', 'name profileImage');
        await updatedComment.populate('provider', 'user');
        await updatedComment.populate({
            path: 'replyBy',
            select: 'user',
            populate: {
                path: 'user',
                select: 'firstName lastName profileImage'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully.",
            comment: updatedComment
        });

    } catch (error) {
        console.error("Error in updateComment controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Delete a comment
 * @route DELETE /api/comments/delete/:commentId
 * @access Private (Customer who wrote it or Admin)
 */
const deleteComment = async (req,res) => {
    try {
        const { commentId } = req.params;
        const user = req.user;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Check if user is the author OR an admin
        const isAuthor = comment.customer.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this comment." });
        }

        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully."
        });

    } catch (error) {
        console.error("Error in deleteComment controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Add a reply to a comment (Provider only)
 * @route POST /api/comments/reply/:commentId
 * @access Private (Provider of the service)
 */
const addReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reply } = req.body;
        const userId = req.user._id;

        if (!reply || !reply.trim()) {
            return res.status(400).json({ success: false, message: "Reply text is required." });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Get the service offering to find the provider
        const serviceOffering = await ServiceOffering.findById(comment.serviceOffering);
        if (!serviceOffering) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Get the provider profile
        const providerProfile = await ProviderProfile.findById(serviceOffering.provider);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // Check if the logged-in user is the provider of this service
        if (providerProfile.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Only the provider of this service can reply to comments." });
        }

        // Check if reply already exists
        if (comment.reply) {
            return res.status(400).json({ success: false, message: "A reply already exists for this comment. Please update it instead." });
        }

        // Add the reply
        comment.reply = reply.trim();
        comment.replyBy = providerProfile._id;
        comment.replyCreatedAt = new Date();
        await comment.save();

        // Populate all necessary fields for response
        await comment.populate('customer', 'firstName lastName profileImage');
        await comment.populate({
            path: 'replyBy',
            select: 'user',
            populate: {
                path: 'user',
                select: 'firstName lastName profileImage'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Reply added successfully.",
            comment
        });

    } catch (error) {
        console.error("Error in addReply controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Update a reply to a comment (Provider only)
 * @route PUT /api/comments/reply/:commentId
 * @access Private (Provider of the service)
 */
const updateReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reply } = req.body;
        const userId = req.user._id;

        if (!reply || !reply.trim()) {
            return res.status(400).json({ success: false, message: "Reply text is required." });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        if (!comment.reply) {
            return res.status(400).json({ success: false, message: "No reply exists for this comment." });
        }

        // Get the service offering to find the provider
        const serviceOffering = await ServiceOffering.findById(comment.serviceOffering);
        if (!serviceOffering) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Get the provider profile
        const providerProfile = await ProviderProfile.findById(serviceOffering.provider);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // Check if the logged-in user is the provider of this service
        if (providerProfile.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Only the provider of this service can update replies." });
        }

        // Update the reply
        comment.reply = reply.trim();
        await comment.save();

        // Populate all necessary fields for response
        await comment.populate('customer', 'firstName lastName profileImage');
        await comment.populate({
            path: 'replyBy',
            select: 'user',
            populate: {
                path: 'user',
                select: 'firstName lastName profileImage'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Reply updated successfully.",
            comment
        });

    } catch (error) {
        console.error("Error in updateReply controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Delete a reply to a comment (Provider only)
 * @route DELETE /api/comments/reply/:commentId
 * @access Private (Provider of the service)
 */
const deleteReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        if (!comment.reply) {
            return res.status(400).json({ success: false, message: "No reply exists for this comment." });
        }

        // Get the service offering to find the provider
        const serviceOffering = await ServiceOffering.findById(comment.serviceOffering);
        if (!serviceOffering) {
            return res.status(404).json({ success: false, message: "Service offering not found." });
        }

        // Get the provider profile
        const providerProfile = await ProviderProfile.findById(serviceOffering.provider);
        if (!providerProfile) {
            return res.status(404).json({ success: false, message: "Provider profile not found." });
        }

        // Check if the logged-in user is the provider of this service
        if (providerProfile.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Only the provider of this service can delete replies." });
        }

        // Delete the reply
        comment.reply = undefined;
        comment.replyBy = undefined;
        comment.replyCreatedAt = undefined;
        await comment.save();

        // Populate customer field for response
        await comment.populate('customer', 'name profileImage');

        return res.status(200).json({
            success: true,
            message: "Reply deleted successfully.",
            comment
        });

    } catch (error) {
        console.error("Error in deleteReply controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get top services based on ratings and review counts
 * @route GET /api/comments/top-services
 * @access Public
 */
const getTopServices = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        // Aggregate comments to calculate average rating and review count per service
        const topServices = await Comment.aggregate([
            {
                $group: {
                    _id: "$serviceOffering",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            },
            {
                $sort: { 
                    averageRating: -1,  // Sort by average rating first
                    reviewCount: -1      // Then by review count
                }
            },
            {
                $limit: limit
            }
        ]);

        // Get service offering IDs
        const serviceIds = topServices.map(s => s._id);

        // Fetch full service offering details with provider info
        const services = await ServiceOffering.find({ _id: { $in: serviceIds } })
            .populate({
                path: 'provider',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName profileImage email phoneNumber'
                }
            })
            .select('servicename serviceCategory description portfolioImages provider experience keywords subCategories price');
        
        // Debug: Log user data to see what's actually being returned
        services.forEach(service => {
            if (service.provider?.user) {
            }
        });

        // Combine with rating data and maintain sort order
        const servicesWithRatings = services.map(service => {
            const ratingData = topServices.find(s => s._id.toString() === service._id.toString());
            
            // Convert to plain object
            const serviceObj = service.toObject();
            
            // Ensure provider.user has firstName/lastName fields explicitly set
            // This ensures they're included even if undefined (Mongoose might exclude undefined fields)
            if (serviceObj.provider?.user) {
                const populatedUser = service.provider?.user;
                // Explicitly set fields to ensure they're in the response
                serviceObj.provider.user.firstName = populatedUser?.firstName;
                serviceObj.provider.user.lastName = populatedUser?.lastName;
                serviceObj.provider.user.email = populatedUser?.email;
                // Remove virtual name field if firstName/lastName exist (to avoid confusion)
                if (populatedUser?.firstName || populatedUser?.lastName) {
                    delete serviceObj.provider.user.name;
                }
            }
            
            return {
                ...serviceObj,
                averageRating: ratingData?.averageRating || 0,
                reviewCount: ratingData?.reviewCount || 0
            };
        });

        // Re-sort to maintain order (in case populate changes order)
        servicesWithRatings.sort((a, b) => {
            if (b.averageRating !== a.averageRating) {
                return b.averageRating - a.averageRating;
            }
            return b.reviewCount - a.reviewCount;
        });

        return res.status(200).json({
            success: true,
            services: servicesWithRatings
        });

    } catch (error) {
        console.error("Error in getTopServices controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Get top categories based on average ratings and review counts
 * @route GET /api/comments/top-categories
 * @access Public
 */
const getTopCategories = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        // Use aggregation to join comments with service offerings and calculate category stats
        const categoryStats = await Comment.aggregate([
            {
                $lookup: {
                    from: 'serviceofferings',
                    localField: 'serviceOffering',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            {
                $unwind: {
                    path: '$service',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: '$service.serviceCategory',
                    totalRating: { $sum: '$rating' },
                    reviewCount: { $sum: 1 },
                    serviceCount: { $addToSet: '$serviceOffering' }
                }
            },
            {
                $project: {
                    category: '$_id',
                    averageRating: { $divide: ['$totalRating', '$reviewCount'] },
                    reviewCount: 1,
                    serviceCount: { $size: '$serviceCount' },
                    _id: 0
                }
            },
            {
                $sort: { 
                    averageRating: -1,
                    reviewCount: -1
                }
            },
            {
                $limit: limit
            }
        ]);

        return res.status(200).json({
            success: true,
            categories: categoryStats
        });

    } catch (error) {
        console.error("Error in getTopCategories controller:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {
    createComment,
    getCommentsForService,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply,
    getTopServices,
    getTopCategories
};