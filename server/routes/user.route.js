import express from 'express';
import { 
    checkAuth, 
    login, 
    logout, 
    register,
    listSignupCommunities,
    getCommunityFeatures,
    listCommunityBroadcasts,
    listMemberCommunityEvents,
    createMemberCommunityEvent,
    deleteMemberCommunityEvent,
    updateUserProfile, 
    changePassword,
    forgotPassword,
    resetPassword,
    addServiceToWishlist, 
    removeServiceFromWishlist 
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/user.middleware.js';
import upload from '../middlewares/multer.js';
import { eventAttachmentUpload } from '../middlewares/eventAttachmentUpload.js';

const userRouter = express.Router();

userRouter.get('/signup-communities', listSignupCommunities);
userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.get('/check-auth', protect, checkAuth);
userRouter.get('/community-features', protect, getCommunityFeatures);
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
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post('/wishlist/:serviceId', protect, addServiceToWishlist);
userRouter.delete('/wishlist/:serviceId', protect, removeServiceFromWishlist);

export default userRouter;