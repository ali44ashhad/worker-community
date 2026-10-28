const buckets = new Map();

function clientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * Fixed-window limiter. `keyExtra` separates buckets (phone, email) as well as IP.
 */
export function rateLimit({ windowMs, max, keyExtra }) {
    return (req, res, next) => {
        const now = Date.now();
        const extra = typeof keyExtra === "function" ? keyExtra(req) : "";
        const key = `${req.baseUrl || ""}${req.path}:${clientIp(req)}:${extra}`;
        let entry = buckets.get(key);
        if (!entry || now - entry.start >= windowMs) {
            entry = { start: now, count: 0 };
            buckets.set(key, entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            const retryAfter = Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000));
            res.setHeader("Retry-After", String(retryAfter));
            return res.status(429).json({
                success: false,
                message: "Too many attempts. Please wait and try again.",
            });
        }
        if (buckets.size > 5000) {
            for (const [bucketKey, bucket] of buckets) {
                if (now - bucket.start >= windowMs) buckets.delete(bucketKey);
            }
        }
        next();
    };
}

export function phoneKey(req) {
    return String(req.body?.phoneNumber || "").replace(/\D/g, "").slice(-10);
}

export function emailKey(req) {
    return String(req.body?.email || "").trim().toLowerCase();
}
