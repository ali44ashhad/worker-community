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

export const getPublicProviderMatch = () => ({
    $or: [
        { "providerUser.isPublicMember": true },
        { "providerUser.communityCommunName": { $exists: false } },
        { "providerUser.communityCommunName": null },
        { "providerUser.communityCommunName": "" },
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
                            isPublicMember: 1,
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

const cleanFilterText = (value, max = 80) => String(value || "").trim().slice(0, max);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildPublicServicesPipeline({
    communityHandle,
    enabledCategories,
    publicOnly = false,
    skip,
    limit,
    search = "",
    category = "",
    subcategory = "",
    keyword = "",
    minRating = 0,
    sort = "newest",
}) {
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
                            isPublicMember: 1,
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
    } else if (publicOnly) {
        pipeline.push({ $match: getPublicProviderMatch() });
    }

    if (Array.isArray(enabledCategories)) {
        if (!enabledCategories.length) {
            pipeline.push({ $match: { _id: null } });
        } else {
            pipeline.push({ $match: { serviceCategory: { $in: enabledCategories } } });
        }
    }

    const categoryName = cleanFilterText(category);
    const subcategoryName = cleanFilterText(subcategory);
    const keywordName = cleanFilterText(keyword);
    const searchTerm = cleanFilterText(search).replace(/[''`´′ʻ]/g, "'");
    const ratingFloor = Number(minRating);
    const listMatch = [];

    if (categoryName) listMatch.push({ $match: { serviceCategory: categoryName } });
    if (subcategoryName) listMatch.push({ $match: { subCategories: subcategoryName } });
    if (keywordName) listMatch.push({ $match: { keywords: keywordName } });
    if (searchTerm) {
        const pattern = escapeRegex(searchTerm);
        listMatch.push({
            $match: {
                $or: [
                    { servicename: { $regex: pattern, $options: "i" } },
                    { serviceCategory: { $regex: pattern, $options: "i" } },
                    { description: { $regex: pattern, $options: "i" } },
                    { keywords: { $regex: pattern, $options: "i" } },
                    { subCategories: { $regex: pattern, $options: "i" } },
                    { "providerUser.firstName": { $regex: pattern, $options: "i" } },
                    { "providerUser.lastName": { $regex: pattern, $options: "i" } },
                    {
                        $expr: {
                            $regexMatch: {
                                input: {
                                    $trim: {
                                        input: {
                                            $concat: [
                                                { $ifNull: ["$providerUser.firstName", ""] },
                                                " ",
                                                { $ifNull: ["$providerUser.lastName", ""] },
                                            ],
                                        },
                                    },
                                },
                                regex: pattern,
                                options: "i",
                            },
                        },
                    },
                ],
            },
        });
    }

    const needsRating = Number.isFinite(ratingFloor) && ratingFloor > 0;
    const ratingStages = [
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
                            reviewCount: {
                                $sum: {
                                    $cond: [
                                        { $gt: [{ $ifNull: ["$comment", ""] }, ""] },
                                        1,
                                        0,
                                    ],
                                },
                            },
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
    const ratingFloorMatch = needsRating ? [{ $match: { averageRating: { $gte: ratingFloor } } }] : [];
    const sortStage = {
        $sort: sort === "clicks" ? { serviceOfferingCount: -1, createdAt: -1 } : { createdAt: -1 },
    };

    pipeline.push({
        $facet: {
            categories: [
                { $group: { _id: "$serviceCategory" } },
                { $match: { _id: { $type: "string", $ne: "" } } },
                { $sort: { _id: 1 } },
            ],
            subcategories: categoryName
                ? [
                      { $match: { serviceCategory: categoryName } },
                      { $unwind: "$subCategories" },
                      { $group: { _id: "$subCategories" } },
                      { $match: { _id: { $type: "string", $ne: "" } } },
                      { $sort: { _id: 1 } },
                  ]
                : [{ $match: { _id: null } }],
            data: [...listMatch, ...ratingStages, ...ratingFloorMatch, sortStage, { $skip: skip }, { $limit: limit }],
            meta: [...listMatch, ...(needsRating ? [...ratingStages, ...ratingFloorMatch] : []), { $count: "total" }],
        },
    });

    return pipeline;
}
