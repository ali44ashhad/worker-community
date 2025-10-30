import express from "express";
import {
    createComment,
    getCommentsForService,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { protect, isAdmin } from "../middlewares/user.middleware.js";

const commentRouter = express.Router();

// @route   POST /api/comments/create-comment/:serviceId
// @desc    Create a new comment for a service offering
// @access  Private (Any logged-in user)
commentRouter.post(
    "/create-comment/:serviceId",
    protect, // Any logged-in user can comment
    createComment
);

// @route   GET /api/comments/get-comments/:serviceId
// @desc    Get all comments for a service offering
// @access  Public
commentRouter.get(
    "/get-comments/:serviceId",
    getCommentsForService
);

// @route   PUT /api/comments/:commentId
// @desc    Update your own comment
// @access  Private (Author)
commentRouter.put(
    "/update-comment/:commentId",
    protect, // The controller checks if user is the author
    updateComment
);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private (Author or Admin)
commentRouter.delete(
    "/delete/:commentId",
    protect, // The controller checks if user is author or admin
    deleteComment
);

export default commentRouter;