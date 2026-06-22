import User from "../models/user.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import { normalizeCategoryToggles, resolveEnabledCategoryNames } from "./categoryToggles.js";

export const getMemberCommunityHandle = (user) => {
    if (!user) return "";
    if (user.role === "secretary") {
        return user.communName ? String(user.communName).trim().toLowerCase() : "";
    }
    return user.communityCommunName
        ? String(user.communityCommunName).trim().toLowerCase()
        : user.communName
          ? String(user.communName).trim().toLowerCase()
          : "";
};

export const getCommunityProviderMatch = (communityHandle) => ({
    $or: [
        { "providerUser.communityCommunName": communityHandle },
        { "providerUser.communName": communityHandle },
    ],
});

const approvedActiveUserMatch = {
    isActive: { $ne: false },
    $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
};

export async function getSecretaryForCommunity(communityHandle) {
    if (!communityHandle) return null;
    return User.findOne({
        role: "secretary",
        communName: communityHandle,
        isActive: { $ne: false },
    })
        .select("categoryToggles communName")
        .lean();
}

export async function getCommunityCategoryStats(communityHandle) {
    if (!communityHandle) return [];

    const rows = await ServiceOffering.aggregate([
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
                    { $match: approvedActiveUserMatch },
                    {
                        $project: {
                            communityCommunName: 1,
                            communName: 1,
                        },
                    },
                ],
                as: "providerUser",
            },
        },
        { $unwind: "$providerUser" },
        { $match: getCommunityProviderMatch(communityHandle) },
        {
            $group: {
                _id: "$serviceCategory",
                serviceCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return rows
        .filter((row) => row?._id)
        .map((row) => ({
            name: row._id,
            serviceCount: row.serviceCount || 0,
        }));
}

export async function getEnabledCategoriesForCommunity(communityHandle) {
    const categories = await getCommunityCategoryStats(communityHandle);
    const categoryNames = categories.map((item) => item.name);
    if (!categoryNames.length) return [];

    const secretary = await getSecretaryForCommunity(communityHandle);
    const toggles = normalizeCategoryToggles(secretary?.categoryToggles);
    return resolveEnabledCategoryNames(toggles, categoryNames);
}

export function buildPublicServicesPipeline({ communityHandle, enabledCategories, skip, limit }) {
    const userMatch = approvedActiveUserMatch;

    const pipeline = [
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
    ];

    if (communityHandle) {
        pipeline.push({ $match: getCommunityProviderMatch(communityHandle) });
    }

    if (Array.isArray(enabledCategories)) {
        if (!enabledCategories.length) {
            pipeline.push({ $match: { _id: null } });
        } else {
            pipeline.push({ $match: { serviceCategory: { $in: enabledCategories } } });
        }
    }

    pipeline.push(
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
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                meta: [{ $count: "total" }],
            },
        }
    );

    return pipeline;
}
