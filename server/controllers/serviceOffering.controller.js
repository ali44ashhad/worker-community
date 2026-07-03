import mongoose from "mongoose";
import ServiceOffering from "../models/serviceOffering.model.js";
import {
    buildPublicServicesPipeline,
    getEnabledCategoriesForCommunity,
    getMemberCommunityHandle,
} from "../utils/communityServices.js";

const parsePagination = (req) => {
    const pageParam = parseInt(req.query.page, 10);
    const limitParam = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 12;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const runServicesQuery = async ({ communityHandle, enabledCategories, page, limit, skip }) => {
    const pipeline = buildPublicServicesPipeline({
        communityHandle,
        enabledCategories,
        skip,
        limit,
    });

    const [result] = await ServiceOffering.aggregate(pipeline);
    const services = result?.data || [];
    const total = result?.meta?.[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        services,
        pagination: { page, limit, total, totalPages },
    };
};

/**
 * @description Public paginated services list (12 per page by default)
 * @route GET /api/service-offering?page=1&limit=12
 * @access Public
 */
const getPublicServices = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req);
        const { services, pagination } = await runServicesQuery({
            communityHandle: null,
            enabledCategories: null,
            page,
            limit,
            skip,
        });

        return res.status(200).json({
            success: true,
            services,
            pagination,
        });
    } catch (error) {
        console.error("Error in getPublicServices:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Community-scoped services for logged-in members (filtered by secretary category toggles)
 * @route GET /api/service-offering/community?page=1&limit=12
 * @access Private (customer, provider, secretary)
 */
const getCommunityServices = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                services: [],
                pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
                communityCommunName: null,
                needsCommunity: true,
            });
        }

        const { page, limit, skip } = parsePagination(req);
        const enabledCategories = await getEnabledCategoriesForCommunity(communityHandle);
        const { services, pagination } = await runServicesQuery({
            communityHandle,
            enabledCategories,
            page,
            limit,
            skip,
        });

        return res.status(200).json({
            success: true,
            services,
            pagination,
            communityCommunName: communityHandle,
            needsCommunity: false,
        });
    } catch (error) {
        console.error("Error in getCommunityServices:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Public top services by clicks
 * @route GET /api/service-offering/top-clicked?limit=6
 * @access Public
 */
const getTopServicesByClicks = async (req, res) => {
    try {
        const limitParam = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 12) : 6;

        const userMatch = {
            isActive: { $ne: false },
            $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
        };

        const pipeline = [
            { $sort: { serviceOfferingCount: -1, createdAt: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "providerprofiles",
                    localField: "provider",
                    foreignField: "_id",
                    as: "providerProfile",
                },
            },
            { $unwind: "$providerProfile" },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$providerProfile.user" },
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
                                communName: 1,
                                communityCommunName: 1,
                            },
                        },
                    ],
                    as: "providerUser",
                },
            },
            { $unwind: "$providerUser" },
            {
                $lookup: {
                    from: "comments",
                    let: { serviceId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$serviceOffering", "$$serviceId"] } } },
                        {
                            $group: {
                                _id: "$serviceOffering",
                                averageRating: { $avg: "$rating" },
                                reviewCount: { $sum: 1 },
                            },
                        },
                    ],
                    as: "ratingStats",
                },
            },
            {
                $addFields: {
                    averageRating: {
                        $ifNull: [{ $round: [{ $arrayElemAt: ["$ratingStats.averageRating", 0] }, 2] }, 0],
                    },
                    reviewCount: { $ifNull: [{ $arrayElemAt: ["$ratingStats.reviewCount", 0] }, 0] },
                    provider: {
                        _id: "$providerProfile._id",
                        bio: "$providerProfile.bio",
                        providerProfileCount: "$providerProfile.providerProfileCount",
                        user: "$providerUser",
                    },
                },
            },
            { $project: { ratingStats: 0, providerProfile: 0, providerUser: 0 } },
        ];

        const services = await ServiceOffering.aggregate(pipeline);

        return res.status(200).json({ success: true, services });
    } catch (error) {
        console.error("Error in getTopServicesByClicks:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @description Fetch a single service offering by id (includes provider profile + user)
 * @route GET /api/service-offering/:id
 * @access Public
 */
const getServiceOfferingById = async (req, res) => {
    try {
        const { id } = req.params;

        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "providerprofiles",
                    localField: "provider",
                    foreignField: "_id",
                    as: "providerProfile",
                },
            },
            { $unwind: { path: "$providerProfile", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$providerProfile.user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
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
                                communName: 1,
                                communityCommunName: 1,
                                isActive: 1,
                                accountStatus: 1,
                                role: 1,
                            },
                        },
                    ],
                    as: "providerUser",
                },
            },
            { $unwind: { path: "$providerUser", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    provider: {
                        _id: "$providerProfile._id",
                        bio: "$providerProfile.bio",
                        providerProfileCount: "$providerProfile.providerProfileCount",
                        user: "$providerUser",
                    },
                },
            },
            { $project: { providerProfile: 0, providerUser: 0 } },
            { $limit: 1 },
        ];

        const results = await ServiceOffering.aggregate(pipeline);
        const service = results?.[0];

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        return res.status(200).json({ success: true, service });
    } catch (error) {
        console.error("Error in getServiceOfferingById:", error?.message || error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { getPublicServices, getCommunityServices, getTopServicesByClicks, getServiceOfferingById };
