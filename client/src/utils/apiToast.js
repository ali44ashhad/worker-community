/**
 * Detect session/auth failures so we show one global message instead of many toasts.
 */
export function isAuthApiError(status, data, message) {
    if (status !== 401) return false;

    const code = data?.code;
    if (code === "JWT_EXPIRED" || code === "JWT_INVALID") return true;

    const msg = String(message || data?.message || "").toLowerCase();
    if (!msg) return false;

    return (
        msg.includes("jwt expired") ||
        msg.includes("invalid session") ||
        msg.includes("session expired") ||
        (msg.includes("unauthorized") && msg.includes("invalid token"))
    );
}

export function shouldToastApiMessage(message, status, data) {
    if (isAuthApiError(status, data, message)) return false;
    return Boolean(message);
}

export function shouldToastRejectPayload(payload, meta) {
    if (!payload) return false;
    const message = typeof payload === "string" ? payload : payload?.message;
    const status = meta?.status;
    const data = meta?.data;
    return shouldToastApiMessage(message, status, data);
}
