import Comment from "../models/comment.model.js";
import mongoose from "mongoose";
import { getMemberCommunityHandle } from "../utils/communityServices.js";
import { invalidateCommentCaches, isCommentInCommunity } from "../utils/reviewScope.js";

function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = typeof query.search === "string" ? query.search.trim() : "";
    return { page, limit, search, skip: (page - 1) * limit };
}

function escapeRegex(search) {
    return search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Shared lookups: reviewer + service + provider user (via service.provider OR comment.provider). */
function reviewEnrichmentStages() {
    return [
        {
            $lookup: {
                from: "users",
                localField: "customer",
                foreignField: "_id",
                as: "customerDoc",
            },
        },
        { $unwind: { path: "$customerDoc", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "serviceofferings",
                localField: "serviceOffering",
                foreignField: "_id",
                as: "serviceDoc",
            },
        },
        { $unwind: { path: "$serviceDoc", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                resolvedProviderProfileId: {
                    $ifNull: ["$serviceDoc.provider", "$provider"],
                },
            },
        },
        {
            $lookup: {
                from: "providerprofiles",
                localField: "resolvedProviderProfileId",
                foreignField: "_id",
                as: "providerProfileDoc",
            },
        },
        { $unwind: { path: "$providerProfileDoc", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "providerProfileDoc.user",
                foreignField: "_id",
                as: "providerUserDoc",
            },
        },
        { $unwind: { path: "$providerUserDoc", preserveNullAndEmptyArrays: true } },
    ];
}

function shapeReview(doc) {
    const customer = doc.customerDoc
        ? {
              _id: doc.customerDoc._id,
              firstName: doc.customerDoc.firstName,
              lastName: doc.customerDoc.lastName,
              email: doc.customerDoc.email,
              profileImage: doc.customerDoc.profileImage,
              communityCommunName: doc.customerDoc.communityCommunName,
              communName: doc.customerDoc.communName,
              isPublicMember: doc.customerDoc.isPublicMember,
              role: doc.customerDoc.role,
          }
        : null;

    const providerUser = doc.providerUserDoc
        ? {
              _id: doc.providerUserDoc._id,
              firstName: doc.providerUserDoc.firstName,
              lastName: doc.providerUserDoc.lastName,
              email: doc.providerUserDoc.email,
              profileImage: doc.providerUserDoc.profileImage,
              communityCommunName: doc.providerUserDoc.communityCommunName,
              communName: doc.providerUserDoc.communName,
              isPublicMember: doc.providerUserDoc.isPublicMember,
          }
        : null;

    const serviceOffering = doc.serviceDoc
        ? {
              _id: doc.serviceDoc._id,
              servicename: doc.serviceDoc.servicename,
              serviceCategory: doc.serviceDoc.serviceCategory,
              provider: doc.providerProfileDoc
                  ? { _id: doc.providerProfileDoc._id, user: providerUser }
                  : providerUser
                    ? { user: providerUser }
                    : null,
          }
        : providerUser
          ? {
                _id: doc.serviceOffering || null,
                servicename: null,
                serviceCategory: null,
                provider: doc.providerProfileDoc
                    ? { _id: doc.providerProfileDoc._id, user: providerUser }
                    : { user: providerUser },
                missingService: true,
            }
          : doc.serviceOffering
            ? {
                  _id: doc.serviceOffering,
                  servicename: null,
                  serviceCategory: null,
                  provider: null,
                  missingService: true,
              }
            : null;

    return {
        _id: doc._id,
        comment: doc.comment,
        rating: doc.rating,
        reply: doc.reply,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        customer,
        serviceOffering,
        provider: doc.provider || doc.resolvedProviderProfileId || null,
        reviewerCommunity:
            customer?.communityCommunName || customer?.communName || null,
        providerCommunity:
            providerUser?.communityCommunName || providerUser?.communName || null,
    };
}

function communityMatchExpr(communityHandle) {
    const handle = String(communityHandle || "").trim().toLowerCase();
    return {
        $or: [
            {
                $eq: [
                    { $toLower: { $ifNull: ["$providerUserDoc.communityCommunName", ""] } },
                    handle,
                ],
            },
            {
                $eq: [{ $toLower: { $ifNull: ["$providerUserDoc.communName", ""] } }, handle],
            },
            {
                $eq: [
                    { $toLower: { $ifNull: ["$customerDoc.communityCommunName", ""] } },
                    handle,
                ],
            },
            {
                $eq: [{ $toLower: { $ifNull: ["$customerDoc.communName", ""] } }, handle],
            },
        ],
    };
}

async function listReviews({ page, limit, skip, search, communityHandle = null }) {
    const pipeline = [...reviewEnrichmentStages()];

    if (communityHandle) {
        pipeline.push({ $match: { $expr: communityMatchExpr(communityHandle) } });
    }

    if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        pipeline.push({
            $match: {
                $or: [
                    { comment: regex },
                    { "customerDoc.firstName": regex },
                    { "customerDoc.lastName": regex },
                    { "customerDoc.email": regex },
                    { "customerDoc.communityCommunName": regex },
                    { "serviceDoc.servicename": regex },
                    { "serviceDoc.serviceCategory": regex },
                    { "providerUserDoc.firstName": regex },
                    { "providerUserDoc.lastName": regex },
                    { "providerUserDoc.email": regex },
                    { "providerUserDoc.communityCommunName": regex },
                ],
            },
        });
    }

    pipeline.push({
        $facet: {
            total: [{ $count: "count" }],
            rows: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
        },
    });

    const [facet] = await Comment.aggregate(pipeline);
    const total = facet?.total?.[0]?.count || 0;
    const reviews = (facet?.rows || []).map(shapeReview);
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return {
        reviews,
        pagination: {
            currentPage: page,
            totalPages,
            totalReviews: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit,
        },
    };
}

async function loadEnrichedReview(commentId) {
    const id =
        typeof commentId === "string"
            ? new mongoose.Types.ObjectId(commentId)
            : commentId;
    const rows = await Comment.aggregate([
        { $match: { _id: id } },
        ...reviewEnrichmentStages(),
    ]);
    if (!rows.length) return null;
    return shapeReview(rows[0]);
}

async function applyReviewUpdate(commentId, { comment, rating }) {
    if (!comment || !String(comment).trim()) {
        const err = new Error("Comment text is required.");
        err.status = 400;
        throw err;
    }
    const ratingNum = parseInt(rating, 10);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
        const err = new Error("Rating is required and must be between 1 and 5.");
        err.status = 400;
        throw err;
    }

    const existing = await Comment.findById(commentId);
    if (!existing) {
        const err = new Error("Comment not found.");
        err.status = 404;
        throw err;
    }

    existing.comment = String(comment).trim();
    existing.rating = ratingNum;
    await existing.save();
    invalidateCommentCaches();

    return loadEnrichedReview(existing._id);
}

async function applyReviewDelete(commentId) {
    const existing = await Comment.findById(commentId);
    if (!existing) {
        const err = new Error("Comment not found.");
        err.status = 404;
        throw err;
    }
    await Comment.findByIdAndDelete(commentId);
    invalidateCommentCaches();
    return true;
}

export const listReviewsAdmin = async (req, res) => {
    try {
        const { page, limit, skip, search } = parsePagination(req.query);
        const data = await listReviews({ page, limit, skip, search, communityHandle: null });
        return res.status(200).json({ success: true, ...data });
    } catch (error) {
        console.error("listReviewsAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateReviewAdmin = async (req, res) => {
    try {
        const updated = await applyReviewUpdate(req.params.commentId, req.body || {});
        return res.status(200).json({
            success: true,
            message: "Review updated successfully.",
            review: updated,
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Internal Server Error" : error.message,
        });
    }
};

export const deleteReviewAdmin = async (req, res) => {
    try {
        await applyReviewDelete(req.params.commentId);
        return res.status(200).json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Internal Server Error" : error.message,
        });
    }
};

export const listReviewsSecretary = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                reviews: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalReviews: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                    limit: 10,
                },
                needsCommunName: true,
                communityCommunName: null,
            });
        }

        const { page, limit, skip, search } = parsePagination(req.query);
        const data = await listReviews({ page, limit, skip, search, communityHandle });

        return res.status(200).json({
            success: true,
            ...data,
            needsCommunName: false,
            communityCommunName: communityHandle,
        });
    } catch (error) {
        console.error("listReviewsSecretary:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateReviewSecretary = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(403).json({
                success: false,
                message: "Secretary Commun handle is not set.",
            });
        }

        const { commentId } = req.params;
        const existing = await Comment.findById(commentId);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        // Allow if provider OR reviewer is in this community (same as list filter)
        const enriched = await loadEnrichedReview(existing._id);
        const handle = communityHandle;
        const providerMatch =
            String(enriched?.providerCommunity || "").trim().toLowerCase() === handle;
        const reviewerMatch =
            String(enriched?.reviewerCommunity || "").trim().toLowerCase() === handle;
        const legacyInScope = await isCommentInCommunity(existing, communityHandle);

        if (!providerMatch && !reviewerMatch && !legacyInScope) {
            return res.status(403).json({
                success: false,
                message: "You can only edit reviews for services in your community.",
            });
        }

        const updated = await applyReviewUpdate(commentId, req.body || {});
        return res.status(200).json({
            success: true,
            message: "Review updated successfully.",
            review: updated,
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Internal Server Error" : error.message,
        });
    }
};

export const deleteReviewSecretary = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(403).json({
                success: false,
                message: "Secretary Commun handle is not set.",
            });
        }

        const { commentId } = req.params;
        const existing = await Comment.findById(commentId);
        if (!existing) {
            return res.status(404).json({ success: false, message: "Comment not found." });
        }

        const enriched = await loadEnrichedReview(existing._id);
        const handle = communityHandle;
        const providerMatch =
            String(enriched?.providerCommunity || "").trim().toLowerCase() === handle;
        const reviewerMatch =
            String(enriched?.reviewerCommunity || "").trim().toLowerCase() === handle;
        const legacyInScope = await isCommentInCommunity(existing, communityHandle);

        if (!providerMatch && !reviewerMatch && !legacyInScope) {
            return res.status(403).json({
                success: false,
                message: "You can only delete reviews for services in your community.",
            });
        }

        await applyReviewDelete(commentId);
        return res.status(200).json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Internal Server Error" : error.message,
        });
    }
};
