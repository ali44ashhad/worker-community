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
    forgotPassword,
    resetPassword,
    joinCommunity,
    addServiceToWishlist, 
    removeServiceFromWishlist 
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/user.middleware.js';
import upload from '../middlewares/multer.js';
import { eventAttachmentUpload } from '../middlewares/eventAttachmentUpload.js';

const userRouter = express.Router();

userRouter.get('/signup-communities', listSignupCommunities);
userRouter.post('/signup/send-otp', sendSignupOtp);
userRouter.post('/signup/verify-otp', verifySignupOtp);
userRouter.post('/login/send-otp', sendLoginOtp);
userRouter.post('/login/verify-otp', verifyLoginOtp);
userRouter.post('/register', register);
userRouter.post('/login', login);
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
userRouter.post("/join-community", protect, joinCommunity);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post('/wishlist/:serviceId', protect, addServiceToWishlist);
userRouter.delete('/wishlist/:serviceId', protect, removeServiceFromWishlist);

export default userRouter;