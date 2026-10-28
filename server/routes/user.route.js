import express from 'express';
import { 
    checkAuth, 
    login, 
    logout, 
    register,
    listSignupCommunities,
    sendSignupOtp,
    verifySignupOtp,
    sendLoginOtp,
    verifyLoginOtp,
    getCommunityFeatures,
    listCommunityDirectory,
    listCommunityBroadcasts,
    listMemberCommunityEvents,
    createMemberCommunityEvent,
    deleteMemberCommunityEvent,
    updateUserProfile, 
    changePassword,
    deleteAccount,
    forgotPassword,
    resetPassword,
    joinCommunity,
    addServiceToWishlist, 
    removeServiceFromWishlist 
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/user.middleware.js';
import { emailKey, phoneKey, rateLimit } from '../middlewares/rateLimit.js';

const FIFTEEN_MIN = 15 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const loginLimit = rateLimit({ windowMs: FIFTEEN_MIN, max: 10, keyExtra: emailKey });
const forgotLimit = rateLimit({ windowMs: ONE_HOUR, max: 5, keyExtra: emailKey });
const resetLimit = rateLimit({ windowMs: FIFTEEN_MIN, max: 10 });
const registerLimit = rateLimit({ windowMs: ONE_HOUR, max: 8 });
const otpSendLimit = rateLimit({ windowMs: TEN_MIN, max: 5, keyExtra: phoneKey });
const otpVerifyLimit = rateLimit({ windowMs: FIFTEEN_MIN, max: 8, keyExtra: phoneKey });
import { getInboxCounts, markInboxRead } from '../controllers/inbox.controller.js';
import upload from '../middlewares/multer.js';
import { eventAttachmentUpload } from '../middlewares/eventAttachmentUpload.js';

const userRouter = express.Router();

userRouter.get('/signup-communities', listSignupCommunities);
userRouter.post('/signup/send-otp', otpSendLimit, sendSignupOtp);
userRouter.post('/signup/verify-otp', otpVerifyLimit, verifySignupOtp);
userRouter.post('/login/send-otp', otpSendLimit, sendLoginOtp);
userRouter.post('/login/verify-otp', otpVerifyLimit, verifyLoginOtp);
userRouter.post('/register', registerLimit, register);
userRouter.post('/login', loginLimit, login);
userRouter.post('/logout', logout);
userRouter.get('/check-auth', protect, checkAuth);
userRouter.get('/community-features', protect, getCommunityFeatures);
userRouter.get('/community-directory', protect, listCommunityDirectory);
userRouter.get('/community-broadcasts', protect, listCommunityBroadcasts);
userRouter.get('/community-events', protect, listMemberCommunityEvents);
userRouter.post('/community-events', protect, eventAttachmentUpload, createMemberCommunityEvent);
userRouter.delete('/community-events/:eventId', protect, deleteMemberCommunityEvent);
userRouter.put(
    "/update-profile", 
    protect, 
    upload.single("profileImage"), 
    updateUserProfile
);

userRouter.put("/change-password", protect, changePassword);
userRouter.post("/delete-account", protect, deleteAccount);
userRouter.post("/join-community", protect, joinCommunity);
userRouter.post("/forgot-password", forgotLimit, forgotPassword);
userRouter.post("/reset-password/:token", resetLimit, resetPassword);
userRouter.post('/wishlist/:serviceId', protect, addServiceToWishlist);
userRouter.delete('/wishlist/:serviceId', protect, removeServiceFromWishlist);
userRouter.get('/inbox/counts', protect, getInboxCounts);
userRouter.post('/inbox/mark-read', protect, markInboxRead);

export default userRouter;