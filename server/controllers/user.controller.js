import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import ServiceOffering from '../models/serviceOffering.model.js';
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
    S3_FOLDERS,
    deleteS3AssetByUrl,
    uploadBufferToS3,
} from "../utils/s3Upload.js";
import { normalizeCommunName, isValidCommunName } from "../utils/communName.js";
import { normalizeFeatureToggles } from "../utils/featureToggles.js";
import Broadcast from "../models/broadcast.model.js";
import CommunityEvent from "../models/communityEvent.model.js";
import { validateEventExpiry } from "../utils/communityEvents.js";
import { buildAttachmentsFromRequest, deleteEventAttachments } from "../utils/eventAttachments.js";

// Helper function to generate a token and set the cookie.
const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
    });
};

const sendPasswordResetEmail = async ({ toEmail, resetUrl }) => {
    const host = (process.env.SMTP_HOST || "").trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").trim();
    const from = (process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@commun.in").trim();

    if (!host || !user || !pass) {
        // No SMTP configured; allow API to succeed without sending.
        return { sent: false };
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    await transporter.sendMail({
        from,
        to: toEmail,
        subject: "Reset your password",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2>Reset your password</h2>
            <p>Click the button below to set a new password.</p>
            <p style="margin:16px 0">
              <a href="${resetUrl}" style="background:#111827;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;display:inline-block">
                Reset Password
              </a>
            </p>
            <p>If you did not request this, you can ignore this email.</p>
          </div>
        `,
    });

    return { sent: true };
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required." });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        // Always return success to avoid email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If this email exists, we have sent a password reset link.",
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        const frontendBase = (process.env.FRONTEND_URL || "").trim() || "http://localhost:5173";
        const resetUrl = `${frontendBase.replace(/\/+$/, "")}/reset-password/${rawToken}`;
        try {
            await sendPasswordResetEmail({ toEmail: user.email, resetUrl });
        } catch (mailError) {
            console.log("Password reset email failed:", mailError?.message || mailError);
        }

        return res.status(200).json({
            success: true,
            message: "If this email exists, we have sent a password reset link.",
        });
    } catch (error) {
        console.log("Error in forgotPassword:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error: " + error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Reset token is required." });
        }
        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password is required." });
        }
        if (String(newPassword).length < 8) {
            return res.status(400).json({ success: false, message: "Password should be at least 8 characters" });
        }

        const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        user.password = hashedPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
    } catch (error) {
        console.log("Error in resetPassword:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error: " + error.message });
    }
};

const listSignupCommunities = async (req, res) => {
    try {
        const secretaries = await User.find({
            role: "secretary",
            isActive: true,
            communName: { $exists: true, $nin: [null, ""] },
        })
            .select("communName firstName lastName")
            .sort({ communName: 1 })
            .lean();

        const communities = secretaries.map((s) => ({
            communName: s.communName,
            label: [s.firstName, s.lastName].filter(Boolean).join(" ").trim() || s.communName,
        }));

        return res.status(200).json({
            success: true,
            data: { communities },
        });
    } catch (error) {
        console.error("listSignupCommunities:", error.message);
        return res.status(500).json({ success: false, message: "Could not load Commun communities." });
    }
};

const register = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        communityCommunName,
        communName,
    } = req.body;
    try {
        const rawCommunity =
            communityCommunName !== undefined && communityCommunName !== null && String(communityCommunName).trim() !== ""
                ? communityCommunName
                : communName;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !phoneNumber ||
            rawCommunity === undefined ||
            rawCommunity === null ||
            String(rawCommunity).trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided, including Commun community.",
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password should be at least 8 characters"
            });
        }

        const cn = normalizeCommunName(rawCommunity);
        if (!isValidCommunName(cn)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Commun community selection.",
            });
        }

        const emailNorm = String(email).trim().toLowerCase();
        const isPresent = await User.findOne({ email: emailNorm });
        if (isPresent) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const secretaryForCommunity = await User.findOne({
            role: "secretary",
            isActive: true,
            communName: cn,
        });
        if (!secretaryForCommunity) {
            return res.status(400).json({
                success: false,
                message: "Please choose a valid Commun community from the list.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userPayload = {
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: emailNorm,
            password: hashedPassword,
            phoneNumber: String(phoneNumber).trim(),
            communityCommunName: cn,
            accountStatus: "pending",
            role: "customer",
        };

        // Add address fields if provided
        if (addressLine1) userPayload.addressLine1 = addressLine1;
        if (addressLine2) userPayload.addressLine2 = addressLine2;
        if (city) userPayload.city = city;
        if (state) userPayload.state = state;
        if (zip) userPayload.zip = zip;

        const user = await User.create(userPayload);

        generateToken(user._id, res);
        user.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Account created. A secretary will review your registration shortly.",
            user
        });
    } catch (error) {
        console.log("Error while registering the User", error);
        if (error.code === 11000) {
            const field = error.keyPattern?.email ? "email" : error.keyPattern?.communName ? "Commun name" : "field";
            return res.status(409).json({
                success: false,
                message: `That ${field} is already in use.`,
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: "Email is not registered" });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact admin."
            });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            return res.status(401).json({ success: false, message: "Email or Password is incorrect" });
        }

        generateToken(user._id, res);
        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
    } catch (error) {
        console.log("Error while logging in the user", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            // httpOnly: true,
            // expires: new Date(0)
            httpOnly: true,
            secure: true, 
            sameSite: "none", 
            expires: new Date(0),
            path: "/", 
        });
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        console.log("Error during logout:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const checkAuth = (req, res) => {
    const user = req.user; // This comes from your authentication middleware
    try {
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                user: null
            });
        }
        return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user
        });
    } catch (error) {
        console.log("Error in checkAuth:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --- Controller to Update User Profile ---
const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, addressLine1, addressLine2, city, state, zip } = req.body;
        const userId = req.user._id; // From your auth middleware

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update text fields if they were provided
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (addressLine1 !== undefined) user.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) user.addressLine2 = addressLine2;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (zip !== undefined) user.zip = zip;

        // Handle profile image - prioritize new upload over removal
        // Check for and upload new profile image first
        // req.file comes from multer's upload.single('profileImage')
        if (req.file) {
            if (user.profileImage) {
                await deleteS3AssetByUrl(user.profileImage);
            }
            const { url: imageUrl } = await uploadBufferToS3(
                req.file,
                S3_FOLDERS.PROFILE
            );
            user.profileImage = imageUrl;
        }
        // Handle profile image removal (only if no new file was uploaded)
        else if (req.body.removeProfileImage === 'true' || req.body.removeProfileImage === true) {
            if (user.profileImage) {
                await deleteS3AssetByUrl(user.profileImage);
            }
            user.profileImage = '';
        }

        // Save all changes to the database
        const updatedUser = await user.save();

        updatedUser.password = undefined; // Don't send password back

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log("Error in updateUserProfile:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// --- Controller to Change Password ---
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password should be at least 8 characters"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isCorrectPassword = await bcrypt.compare(
            String(currentPassword),
            String(user.password || "")
        );
        if (!isCorrectPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.log("Error in changePassword:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

// Add service to wishlist
export const addServiceToWishlist = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;
    // Validate service exists
    const service = await ServiceOffering.findById(serviceId);
    if (!service) return res.status(404).json({success: false, message: 'Service not found'});
    // Add (no dupes)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: service._id } },
      { new: true }
    ).populate('wishlist');
    return res.status(200).json({ success: true, wishlist: updatedUser.wishlist });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Remove service from wishlist
export const removeServiceFromWishlist = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: serviceId } },
      { new: true }
    ).populate('wishlist');
    return res.status(200).json({ success: true, wishlist: updatedUser.wishlist });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route GET /api/user/community-features
 * Returns broadcast/events visibility for the logged-in member's Commun community.
 */
const getCommunityFeatures = async (req, res) => {
    try {
        const communityHandle = req.user.communityCommunName
            ? String(req.user.communityCommunName).trim().toLowerCase()
            : "";

        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: {
                    broadcast: false,
                    events: false,
                    communityCommunName: null,
                    hasCommunity: false,
                },
            });
        }

        const secretary = await User.findOne({
            role: "secretary",
            isActive: true,
            communName: communityHandle,
        })
            .select("featureToggles communName")
            .lean();

        if (!secretary) {
            return res.status(200).json({
                success: true,
                data: {
                    broadcast: false,
                    events: false,
                    communityCommunName: communityHandle,
                    hasCommunity: true,
                },
            });
        }

        const featureToggles = normalizeFeatureToggles(secretary.featureToggles);

        return res.status(200).json({
            success: true,
            data: {
                broadcast: Boolean(featureToggles.broadcast),
                events: Boolean(featureToggles.events),
                communityCommunName: communityHandle,
                hasCommunity: true,
            },
        });
    } catch (error) {
        console.error("getCommunityFeatures:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route GET /api/user/community-broadcasts
 */
const listCommunityBroadcasts = async (req, res) => {
    try {
        const communityHandle = req.user.communityCommunName
            ? String(req.user.communityCommunName).trim().toLowerCase()
            : "";

        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: { broadcasts: [], hasCommunity: false },
            });
        }

        const secretary = await User.findOne({
            role: "secretary",
            isActive: true,
            communName: communityHandle,
        })
            .select("featureToggles communName")
            .lean();

        const featureToggles = normalizeFeatureToggles(secretary?.featureToggles);
        if (!secretary || !featureToggles.broadcast) {
            return res.status(200).json({
                success: true,
                data: {
                    broadcasts: [],
                    communityCommunName: communityHandle,
                    hasCommunity: true,
                    broadcastEnabled: false,
                },
            });
        }

        const broadcasts = await Broadcast.find({ communityCommunName: communityHandle })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                broadcasts,
                communityCommunName: communityHandle,
                hasCommunity: true,
                broadcastEnabled: true,
            },
        });
    } catch (error) {
        console.error("listCommunityBroadcasts:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getMemberCommunityHandle = (user) =>
    user.communityCommunName ? String(user.communityCommunName).trim().toLowerCase() : "";

const isCommunityEventsEnabled = async (communityHandle) => {
    if (!communityHandle) return false;
    const secretary = await User.findOne({
        role: "secretary",
        isActive: true,
        communName: communityHandle,
    })
        .select("featureToggles")
        .lean();
    return Boolean(normalizeFeatureToggles(secretary?.featureToggles).events);
};

/**
 * @route GET /api/user/community-events
 */
const listMemberCommunityEvents = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(200).json({
                success: true,
                data: { events: [], hasCommunity: false, eventsEnabled: false },
            });
        }

        const eventsEnabled = await isCommunityEventsEnabled(communityHandle);
        if (!eventsEnabled) {
            return res.status(200).json({
                success: true,
                data: {
                    events: [],
                    communityCommunName: communityHandle,
                    hasCommunity: true,
                    eventsEnabled: false,
                },
            });
        }

        const events = await CommunityEvent.find({
            communityCommunName: communityHandle,
            expiresAt: { $gte: new Date() },
        })
            .populate("author", "firstName lastName role email phoneNumber")
            .sort({ expiresAt: 1, createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({
            success: true,
            data: {
                events,
                communityCommunName: communityHandle,
                hasCommunity: true,
                eventsEnabled: true,
            },
        });
    } catch (error) {
        console.error("listMemberCommunityEvents:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route POST /api/user/community-events
 */
const createMemberCommunityEvent = async (req, res) => {
    try {
        if (!["customer", "provider"].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Only community members can create events here." });
        }

        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({
                success: false,
                message: "Join a Commun community before creating events.",
            });
        }

        const eventsEnabled = await isCommunityEventsEnabled(communityHandle);
        if (!eventsEnabled) {
            return res.status(403).json({
                success: false,
                message: "Events are not enabled for your community.",
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
        console.error("createMemberCommunityEvent:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * @route DELETE /api/user/community-events/:eventId
 */
const deleteMemberCommunityEvent = async (req, res) => {
    try {
        const communityHandle = getMemberCommunityHandle(req.user);
        if (!communityHandle) {
            return res.status(400).json({ success: false, message: "No Commun community on this account." });
        }

        const { eventId } = req.params;
        const event = await CommunityEvent.findOne({
            _id: eventId,
            communityCommunName: communityHandle,
            author: req.user._id,
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found or you can only delete your own events.",
            });
        }

        await deleteEventAttachments(event.attachments);
        await event.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Event deleted.",
            data: { eventId },
        });
    } catch (error) {
        console.error("deleteMemberCommunityEvent:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// --- Single Export Block ---
export {
    listSignupCommunities,
    register,
    login,
    logout,
    checkAuth,
    getCommunityFeatures,
    listCommunityBroadcasts,
    listMemberCommunityEvents,
    createMemberCommunityEvent,
    deleteMemberCommunityEvent,
    updateUserProfile,
    changePassword,
    forgotPassword,
    resetPassword
};