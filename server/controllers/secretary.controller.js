import User from "../models/user.model.js";
import Broadcast from "../models/broadcast.model.js";
import CommunityEvent from "../models/communityEvent.model.js";
import { FEATURE_TOGGLE_KEYS, normalizeFeatureToggles } from "../utils/featureToggles.js";
import { validateEventExpiry } from "../utils/communityEvents.js";
import { buildAttachmentsFromRequest, deleteEventAttachments } from "../utils/eventAttachments.js";
import { sendUserRegistrationApprovedEmail, sendUserRegistrationRejectedEmail } from "../utils/email.js";

const getSecretaryCommunityHandle = (secretary) =>
    secretary.communName ? String(secretary.communName).trim().toLowerCase() : "";
/**
 * @route GET /api/secretary/registrations/pending
 */
const listPendingRegistrations = async (req, res) => {
    try {
        const users = await User.find({
            accountStatus: "pending",
            role: { $nin: ["admin", "secretary"] },
            isActive: { $ne: false },
        })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ success: true, data: { users } });
    } catch (error) {
        console.error("listPendingRegistrations:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route PATCH /api/secretary/registrations/:userId/approve
 */
const approveRegistration = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        if (user.role === "admin" || user.role === "secretary") {
            return res.status(400).json({ success: false, message: "Cannot change this account." });
        }
        if (user.accountStatus !== "pending") {
            return res.status(400).json({ success: false, message: "This account is not pending approval." });
        }

        user.accountStatus = "approved";
        user.isActive = true;
        await user.save();

        try {
            if (user.email) {
                await sendUserRegistrationApprovedEmail({
                    toEmail: String(user.email).trim().toLowerCase(),
                    communityCommunName: user.communityCommunName || "",
                });
            }
        } catch (mailError) {
            console.error("approveRegistration email failed:", mailError?.message || mailError);
        }

        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({
            success: true,
            message: "Account approved.",
            user: safe,
        });
    } catch (error) {
        console.error("approveRegistration:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route PATCH /api/secretary/registrations/:userId/reject
 */
const rejectRegistration = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        if (user.role === "admin" || user.role === "secretary") {
            return res.status(400).json({ success: false, message: "Cannot change this account." });
        }
        if (user.accountStatus !== "pending") {
            return res.status(400).json({ success: false, message: "This account is not pending approval." });
        }

        user.accountStatus = "rejected";
        user.isActive = false;
        await user.save();

        try {
            if (user.email) {
                await sendUserRegistrationRejectedEmail({
                    toEmail: String(user.email).trim().toLowerCase(),
                    communityCommunName: user.communityCommunName || "",
                });
            }
        } catch (mailError) {
            console.error("rejectRegistration email failed:", mailError?.message || mailError);
        }

        return res.status(200).json({
            success: true,
            message: "Registration rejected and account deactivated.",
        });
    } catch (error) {
        console.error("rejectRegistration:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Members who joined this secretary's Commun community (signup `communityCommunName` matches secretary `communName`).
 * @route GET /api/secretary/members
 */
const listCommunityMembers = async (req, res) => {
    try {
        const secretary = req.user;
        const communityHandle = secretary.communName ? String(secretary.communName).trim().toLowerCase() : "";

        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: { users: [], needsCommunName: true },
                message: "No Commun handle on this secretary account. Ask an admin to set it.",
            });
        }

        const users = await User.find({
            communityCommunName: communityHandle,
            role: { $nin: ["admin", "secretary"] },
            _id: { $ne: secretary._id },
        })
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        return res.status(200).json({
            success: true,
            data: { users, communityCommunName: communityHandle, needsCommunName: false },
        });
    } catch (error) {
        console.error("listCommunityMembers:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Update a member's account status within this secretary's community.
 * @route PATCH /api/secretary/members/:userId/status
 * @body { accountStatus: "pending" | "approved" | "rejected", isActive?: boolean }
 */
const updateMemberStatus = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({ success: false, message: "No Commun handle on this account." });
        }

        const { userId } = req.params;
        const { accountStatus, isActive } = req.body || {};

        const allowed = ["pending", "approved", "rejected"];
        if (accountStatus !== undefined && !allowed.includes(accountStatus)) {
            return res.status(400).json({ success: false, message: "Invalid accountStatus." });
        }
        if (isActive !== undefined && typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "Invalid isActive." });
        }

        const user = await User.findOne({
            _id: userId,
            communityCommunName: communityHandle,
            role: { $nin: ["admin", "secretary"] },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "Member not found in your community." });
        }

        const prevStatus = user.accountStatus || "approved";

        if (accountStatus !== undefined) {
            user.accountStatus = accountStatus;
            // Keep isActive aligned with rejection unless explicitly overridden
            if (accountStatus === "rejected" && isActive === undefined) user.isActive = false;
            if (accountStatus === "approved" && isActive === undefined) user.isActive = true;
        }
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        try {
            // Send email only for meaningful transitions
            if (user.email && accountStatus && accountStatus !== prevStatus) {
                if (accountStatus === "approved") {
                    await sendUserRegistrationApprovedEmail({
                        toEmail: String(user.email).trim().toLowerCase(),
                        communityCommunName: user.communityCommunName || "",
                    });
                } else if (accountStatus === "rejected") {
                    await sendUserRegistrationRejectedEmail({
                        toEmail: String(user.email).trim().toLowerCase(),
                        communityCommunName: user.communityCommunName || "",
                    });
                }
            }
        } catch (mailError) {
            console.error("updateMemberStatus email failed:", mailError?.message || mailError);
        }

        const safe = user.toObject();
        delete safe.password;
        return res.status(200).json({
            success: true,
            message: "Member updated.",
            data: { user: safe },
        });
    } catch (error) {
        console.error("updateMemberStatus:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/secretary/features/toggles
 */
const getFeatureToggles = async (req, res) => {
    try {
        const toggles = normalizeFeatureToggles(req.user.featureToggles);
        return res.status(200).json({
            success: true,
            data: {
                toggles,
                communityCommunName: req.user.communName || null,
            },
        });
    } catch (error) {
        console.error("getFeatureToggles:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route PATCH /api/secretary/features/toggles
 * Body: { key: string, enabled: boolean }
 */
const updateFeatureToggle = async (req, res) => {
    try {
        const { key, enabled } = req.body;
        if (!FEATURE_TOGGLE_KEYS.includes(key)) {
            return res.status(400).json({ success: false, message: "Invalid feature." });
        }
        if (typeof enabled !== "boolean") {
            return res.status(400).json({ success: false, message: "enabled must be true or false." });
        }

        const secretary = await User.findById(req.user._id);
        if (!secretary || secretary.role !== "secretary") {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        if (!secretary.featureToggles) {
            secretary.featureToggles = normalizeFeatureToggles();
        }
        secretary.featureToggles[key] = enabled;
        secretary.markModified("featureToggles");
        await secretary.save();

        const toggles = normalizeFeatureToggles(secretary.featureToggles);
        return res.status(200).json({
            success: true,
            message: "Feature setting updated.",
            data: { toggles },
        });
    } catch (error) {
        console.error("updateFeatureToggle:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/secretary/events
 */
const listCommunityEvents = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: { events: [], needsCommunName: true },
            });
        }

        const events = await CommunityEvent.find({ communityCommunName: communityHandle })
            .populate("author", "firstName lastName role email phoneNumber")
            .sort({ expiresAt: -1, createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({
            success: true,
            data: { events, communityCommunName: communityHandle, needsCommunName: false },
        });
    } catch (error) {
        console.error("listCommunityEvents:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route POST /api/secretary/events
 * Body: { title: string, description: string, expiresAt: string }
 */
const createCommunityEvent = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({
                success: false,
                message: "Set your Commun name before creating events.",
            });
        }

        const title = String(req.body?.title || "").trim();
        const description = String(req.body?.description || "").trim();
        const expiryCheck = validateEventExpiry(req.body?.expiresAt);

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }
        if (!description) {
            return res.status(400).json({ success: false, message: "Description is required." });
        }
        if (!expiryCheck.ok) {
            return res.status(400).json({ success: false, message: expiryCheck.message });
        }
        if (title.length > 120) {
            return res.status(400).json({ success: false, message: "Title must be 120 characters or less." });
        }
        if (description.length > 2000) {
            return res.status(400).json({ success: false, message: "Description must be 2000 characters or less." });
        }

        const attachmentResult = await buildAttachmentsFromRequest(req);
        if (!attachmentResult.ok) {
            return res.status(400).json({ success: false, message: attachmentResult.message });
        }

        const event = await CommunityEvent.create({
            communityCommunName: communityHandle,
            author: req.user._id,
            title,
            description,
            expiresAt: expiryCheck.expiresAt,
            attachments: attachmentResult.attachments,
        });

        const populated = await CommunityEvent.findById(event._id)
            .populate("author", "firstName lastName role email phoneNumber")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Event created.",
            data: { event: populated },
        });
    } catch (error) {
        console.error("createCommunityEvent:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route DELETE /api/secretary/events/:eventId
 */
const deleteCommunityEvent = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({ success: false, message: "No Commun handle on this account." });
        }

        const { eventId } = req.params;
        const event = await CommunityEvent.findOne({
            _id: eventId,
            communityCommunName: communityHandle,
        });

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        await deleteEventAttachments(event.attachments);
        await event.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Event deleted.",
            data: { eventId },
        });
    } catch (error) {
        console.error("deleteCommunityEvent:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/secretary/broadcasts
 */
const listBroadcasts = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: { broadcasts: [], needsCommunName: true },
            });
        }

        const broadcasts = await Broadcast.find({ communityCommunName: communityHandle })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({
            success: true,
            data: { broadcasts, communityCommunName: communityHandle, needsCommunName: false },
        });
    } catch (error) {
        console.error("listBroadcasts:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route POST /api/secretary/broadcasts
 * Body: { title: string, message: string }
 */
const createBroadcast = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({
                success: false,
                message: "Set your Commun name before sending broadcasts.",
            });
        }

        const title = String(req.body?.title || "").trim();
        const message = String(req.body?.message || "").trim();

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required." });
        }
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }
        if (title.length > 120) {
            return res.status(400).json({ success: false, message: "Title must be 120 characters or less." });
        }
        if (message.length > 2000) {
            return res.status(400).json({ success: false, message: "Message must be 2000 characters or less." });
        }

        const broadcast = await Broadcast.create({
            communityCommunName: communityHandle,
            author: req.user._id,
            title,
            message,
        });

        return res.status(201).json({
            success: true,
            message: "Broadcast sent to your community.",
            data: { broadcast },
        });
    } catch (error) {
        console.error("createBroadcast:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route DELETE /api/secretary/broadcasts/:broadcastId
 */
const deleteBroadcast = async (req, res) => {
    try {
        const communityHandle = getSecretaryCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({ success: false, message: "No Commun handle on this account." });
        }

        const { broadcastId } = req.params;
        const broadcast = await Broadcast.findOne({
            _id: broadcastId,
            communityCommunName: communityHandle,
        });

        if (!broadcast) {
            return res.status(404).json({ success: false, message: "Broadcast not found." });
        }

        await broadcast.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Broadcast deleted.",
            data: { broadcastId },
        });
    } catch (error) {
        console.error("deleteBroadcast:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {
    listPendingRegistrations,
    approveRegistration,
    rejectRegistration,
    listCommunityMembers,
    updateMemberStatus,
    getFeatureToggles,
    updateFeatureToggle,
    listCommunityEvents,
    createCommunityEvent,
    deleteCommunityEvent,
    listBroadcasts,
    createBroadcast,
    deleteBroadcast,
};
