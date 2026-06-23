import InterestCommunity from "../models/interestCommunity.model.js";
import InterestCommunityMembership from "../models/interestCommunityMembership.model.js";

const listAllAdmin = async (req, res) => {
    try {
        const communities = await InterestCommunity.find({})
            .sort({ createdAt: -1 })
            .lean();

        const withCounts = await Promise.all(
            communities.map(async (c) => {
                const memberCount = await InterestCommunityMembership.countDocuments({
                    interestCommunity: c._id,
                });
                return { ...c, memberCount };
            })
        );

        return res.status(200).json({ success: true, data: { communities: withCounts } });
    } catch (error) {
        console.error("listAllAdmin:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const createCommunity = async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        if (!name || name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Community name is required (min 2 characters).",
            });
        }

        const existing = await InterestCommunity.findOne({
            name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
        if (existing) {
            return res.status(409).json({ success: false, message: "Community name already exists." });
        }

        const community = await InterestCommunity.create({
            name,
            isActive: true,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Community created.",
            data: { community },
        });
    } catch (error) {
        console.error("createCommunity:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const toggleCommunity = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "isActive must be true or false." });
        }

        const community = await InterestCommunity.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );
        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Community ${isActive ? "enabled" : "disabled"}.`,
            data: { community },
        });
    } catch (error) {
        console.error("toggleCommunity:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteCommunity = async (req, res) => {
    try {
        const community = await InterestCommunity.findByIdAndDelete(req.params.id);
        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found." });
        }
        await InterestCommunityMembership.deleteMany({ interestCommunity: community._id });
        return res.status(200).json({ success: true, message: "Community deleted." });
    } catch (error) {
        console.error("deleteCommunity:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { listAllAdmin, createCommunity, toggleCommunity, deleteCommunity };
