/** Session length — keep JWT `expiresIn` and cookie `maxAge` in sync. */
export const JWT_EXPIRES_IN = "30d";
export const JWT_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function isProductionEnv() {
    return process.env.NODE_ENV === "production";
}

export function getAuthCookieSetOptions() {
    const isProduction = isProductionEnv();
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: JWT_COOKIE_MAX_AGE_MS,
        path: "/",
        ...(isProduction ? { domain: ".commun.in" } : {}),
    };
}

/**
 * Remove jwt cookie variants (legacy hosts / duplicate domains after deploy).
 */
export function clearAuthCookies(res) {
    const isProduction = isProductionEnv();
    const baseClear = {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
        maxAge: 0,
    };

    if (isProduction) {
        const variants = [
            { ...baseClear, secure: true, sameSite: "none", domain: ".commun.in" },
            { ...baseClear, secure: true, sameSite: "none" },
            { ...baseClear, secure: true, sameSite: "lax", domain: "commun.in" },
            { ...baseClear, secure: true, sameSite: "lax", domain: "api.commun.in" },
            { ...baseClear, secure: true, sameSite: "lax", domain: ".commun.in" },
        ];
        for (const opts of variants) {
            res.clearCookie("jwt", opts);
        }
    } else {
        res.clearCookie("jwt", { ...baseClear, sameSite: "lax" });
    }
}

export function setAuthCookie(res, token) {
    clearAuthCookies(res);
    res.cookie("jwt", token, getAuthCookieSetOptions());
}
