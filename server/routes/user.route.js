import express from 'express';
import { 
    checkAuth, 
    login, 
    logout, 
    register, 
    updateUserProfile, 
    changePassword,
    forgotPassword,
    resetPassword,
    addServiceToWishlist, 
    removeServiceFromWishlist 
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/user.middleware.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.get('/check-auth', protect, checkAuth);
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