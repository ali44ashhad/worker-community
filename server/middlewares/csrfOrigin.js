import { ALLOWED_ORIGINS } from "../config/allowedOrigins.js";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Browser cross-site mutations carry Origin and Sec-Fetch-Site.
 * Clients without Origin (the mobile app) are left alone.
 */
export function rejectCrossSiteMutation(req, res, next) {
    if (!UNSAFE_METHODS.has(req.method)) return next();

    const fetchSite = String(req.headers["sec-fetch-site"] || "").toLowerCase();
    if (fetchSite === "cross-site") {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to do this.",
        });
    }

    const origin = req.headers.origin;
    if (!origin) return next();
    if (ALLOWED_ORIGINS.has(origin)) return next();

    return res.status(403).json({
        success: false,
        message: "You are not allowed to do this.",
    });
}
