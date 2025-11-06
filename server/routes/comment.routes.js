import express from "express";
import {
    createComment,
    getCommentsForService,
    updateComment,
    deleteComment,
    addReply,
    updateReply,
    deleteReply,
    getTopServices,
    getTopCategories
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

// @route   POST /api/comments/reply/:commentId
// @desc    Add a reply to a comment
// @access  Private (Provider of the service)
commentRouter.post(
    "/reply/:commentId",
    protect,
    addReply
);

// @route   PUT /api/comments/reply/:commentId
// @desc    Update a reply to a comment
// @access  Private (Provider of the service)
commentRouter.put(
    "/reply/:commentId",
    protect,
    updateReply
);

// @route   DELETE /api/comments/reply/:commentId
// @desc    Delete a reply to a comment
// @access  Private (Provider of the service)
commentRouter.delete(
    "/reply/:commentId",
    protect,
    deleteReply
);

// @route   GET /api/comments/top-services
// @desc    Get top services based on ratings and review counts
// @access  Public
commentRouter.get(
    "/top-services",
    getTopServices
);

// @route   GET /api/comments/top-categories
// @desc    Get top categories based on average ratings and review counts
// @access  Public
commentRouter.get(
    "/top-categories",
    getTopCategories
);

export default commentRouter;