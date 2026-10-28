import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isTokenIssuedBeforePasswordChange } from "../utils/authCookie.js";

function requestPath(req) {
    const raw = req.originalUrl || req.url || "";
    const path = raw.split("?")[0];
    if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
    return path;
}

/** Load the session user when a cookie is present. Public routes use this without failing closed. */
export async function loadRequestUser(req) {
    const token = req.cookies?.jwt;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) return null;
        const user = await User.findById(decoded.userId).select("-password");
        if (!user || user.isActive === false) return null;
        if (isTokenIssuedBeforePasswordChange(decoded, user)) return null;
        return user;
    } catch {
        return null;
    }
}

const protect = async (req, res, next) => {
    const token = req.cookies.jwt;
    
    try {
        if (!token) {
            return res.status(401).json({ // Use 401 Unauthorized status
                success: false,
                message: "Please login first to continue"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken) {
            return res.status(401).json({ // Use 401 Unauthorized status
                success: false,
                message: "Unauthorized - Invalid token."
            });
        }

        const user = await User.findById(decodedToken.userId).select("-password");

        if (!user) {
            return res.status(404).json({ // Use 404 Not Found status
                success: false,
                message: "User not found."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact admin."
            });
        }

        if (isTokenIssuedBeforePasswordChange(decodedToken, user)) {
            return res.status(401).json({
                success: false,
                code: "JWT_EXPIRED",
                message: "Your session expired. Please log in again.",
            });
        }

        const accountStatus = user.accountStatus || "approved";
        if (user.role !== "admin" && user.role !== "secretary") {
            const path = requestPath(req);
            const isCheckAuth = path === "/api/user/check-auth";
            const isPush = path.startsWith("/api/push/");

            if (accountStatus === "rejected" && !isCheckAuth && !isPush) {
                return res.status(403).json({
                    success: false,
                    code: "ACCOUNT_REJECTED",
                    message: "Your registration was not approved. Please contact support if you need help.",
                });
            }
            if (accountStatus === "pending" && !isCheckAuth && !isPush) {
                return res.status(403).json({
                    success: false,
                    code: "ACCOUNT_PENDING",
                    message: "Your account is pending secretary approval.",
                });
            }
        }

        req.user = user;
        next();

    } catch (error) {
        const name = error?.name || "";
        if (name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                code: "JWT_EXPIRED",
                message: "Your session expired. Please log in again.",
            });
        }
        if (name === "JsonWebTokenError" || name === "NotBeforeError") {
            return res.status(401).json({
                success: false,
                code: "JWT_INVALID",
                message: "Invalid session. Please log in again.",
            });
        }
        console.error("Error in protect middleware:", error.message);
        return res.status(401).json({
            success: false,
            code: "UNAUTHORIZED",
            message: "Please login first to continue",
        });
    }
};

const isAdmin = (req, res, next) => {
    const user = req.user; // This runs AFTER protect, so req.user exists
    try {
        if (user.role !== "admin") {
            return res.status(403).json({ // Use 403 Forbidden status
                success: false,
                message: "Unauthorized. Admin access required."
            });
        }
        next();
    }
    catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const isProvider = (req, res, next) => {
    const user = req.user;
    try {
        if (user.role !== "provider") {
            return res.status(403).json({ // Use 403 Forbidden status
                success: false,
                message: "Unauthorized. Provider access required."
            });
        }
        const accountStatus = user.accountStatus || "approved";
        if (accountStatus !== "approved") {
            return res.status(403).json({
                success: false,
                code: accountStatus === "pending" ? "ACCOUNT_PENDING" : "ACCOUNT_REJECTED",
                message:
                    accountStatus === "pending"
                        ? "Your provider profile is pending secretary approval."
                        : "Your provider access is not available.",
            });
        }
        next();
    }
    catch (error) {
        console.error("Error in isProvider middleware:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const isSecretary = (req, res, next) => {
    const user = req.user;
    try {
        if (user.role !== "secretary") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized. Secretary access required."
            });
        }
        next();
    } catch (error) {
        console.error("Error in isSecretary middleware:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all middleware functions
export { protect, isAdmin, isProvider, isSecretary };