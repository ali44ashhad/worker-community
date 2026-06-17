import ServiceOffering from "../models/serviceOffering.model.js";
import ProviderProfile from "../models/providerProfile.model.js";

/**
 * @description Public paginated services list (12 per page by default)
 * @route GET /api/service-offering?page=1&limit=12
 * @access Public
 */
const getPublicServices = async (req, res) => {
  try {
    const pageParam = parseInt(req.query.page, 10);
    const limitParam = parseInt(req.query.limit, 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 12;
    const skip = (page - 1) * limit;

    // Approved + active users only (same logic as provider public listing)
    const userMatch = {
      isActive: { $ne: false },
      $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
    };

    const pipeline = [
      // Attach provider profile
      {
        $lookup: {
          from: "providerprofiles",
          localField: "provider",
          foreignField: "_id",
          as: "providerProfile",
        },
      },
      { $unwind: "$providerProfile" },

      // Attach user (and filter by active/approved)
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

      // Rating aggregate per service
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
      },
    ];

    const [result] = await ServiceOffering.aggregate(pipeline);
    const services = result?.data || [];
    const total = result?.meta?.[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      success: true,
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in getPublicServices:", error.message);
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

export { getPublicServices, getTopServicesByClicks };

