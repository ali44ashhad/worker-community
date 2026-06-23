import InterestCommunity from "../models/interestCommunity.model.js";
import InterestCommunityMembership from "../models/interestCommunityMembership.model.js";
import InterestChatMessage from "../models/interestChatMessage.model.js";
import { getMemberCommunName } from "../utils/memberCommun.js";
import { formatCommunDisplayName } from "../utils/communName.js";

const listActiveForMember = async (req, res) => {
    try {
        const communName = getMemberCommunName(req.user);
        if (!communName) {
            return res.status(200).json({
                success: true,
                data: { communities: [], needsCommunName: true, communName: null },
            });
        }

        const communities = await InterestCommunity.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        const memberships = await InterestCommunityMembership.find({
            user: req.user._id,
        })
            .select("interestCommunity")
            .lean();

        const joinedSet = new Set(memberships.map((m) => String(m.interestCommunity)));

        const withStatus = await Promise.all(
            communities.map(async (c) => {
                const memberCount = await InterestCommunityMembership.countDocuments({
                    interestCommunity: c._id,
                    memberCommunName: communName,
                });
                return {
                    _id: c._id,
                    name: c.name,
                    isActive: c.isActive,
                    joined: joinedSet.has(String(c._id)),
                    memberCount,
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: {
                communities: withStatus,
                needsCommunName: false,
                communName,
                communLabel: formatCommunDisplayName(communName),
            },
        });
    } catch (error) {
        console.error("listActiveForMember:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const joinCommunity = async (req, res) => {
    try {
        const communName = getMemberCommunName(req.user);
        if (!communName) {
            return res.status(400).json({
                success: false,
                message: "Join a Commun locality first before joining interest communities.",
            });
        }

        const community = await InterestCommunity.findOne({
            _id: req.params.id,
            isActive: true,
        });
        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found." });
        }

        await InterestCommunityMembership.findOneAndUpdate(
            { user: req.user._id, interestCommunity: community._id },
            { memberCommunName: communName },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: `Joined ${community.name}.`,
            data: { communityId: community._id, joined: true },
        });
    } catch (error) {
        console.error("joinCommunity:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const leaveCommunity = async (req, res) => {
    try {
        await InterestCommunityMembership.deleteOne({
            user: req.user._id,
            interestCommunity: req.params.id,
        });
        return res.status(200).json({ success: true, message: "Left community." });
    } catch (error) {
        console.error("leaveCommunity:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getMembers = async (req, res) => {
    try {
        const communName = getMemberCommunName(req.user);
        if (!communName) {
            return res.status(400).json({ success: false, message: "Commun name required." });
        }

        const membership = await InterestCommunityMembership.findOne({
            user: req.user._id,
            interestCommunity: req.params.id,
        });
        if (!membership) {
            return res.status(403).json({ success: false, message: "Join this community first." });
        }

        const members = await InterestCommunityMembership.find({
            interestCommunity: req.params.id,
            memberCommunName: communName,
        })
            .populate("user", "firstName lastName profileImage role email")
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                members: members.map((m) => ({
                    _id: m.user?._id,
                    firstName: m.user?.firstName,
                    lastName: m.user?.lastName,
                    profileImage: m.user?.profileImage,
                    role: m.user?.role,
                })),
                communName,
                communLabel: formatCommunDisplayName(communName),
            },
        });
    } catch (error) {
        console.error("getMembers:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getMessages = async (req, res) => {
    try {
        const communName = getMemberCommunName(req.user);
        if (!communName) {
            return res.status(400).json({ success: false, message: "Commun name required." });
        }

        const membership = await InterestCommunityMembership.findOne({
            user: req.user._id,
            interestCommunity: req.params.id,
        });
        if (!membership) {
            return res.status(403).json({ success: false, message: "Join this community first." });
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

        const messages = await InterestChatMessage.find({
            interestCommunity: req.params.id,
            communName,
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("author", "firstName lastName profileImage")
            .populate({
                path: "replyTo",
                populate: { path: "author", select: "firstName lastName profileImage" },
            })
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(),
                communName,
            },
        });
    } catch (error) {
        console.error("getMessages:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { listActiveForMember, joinCommunity, leaveCommunity, getMembers, getMessages };
