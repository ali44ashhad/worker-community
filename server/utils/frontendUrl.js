function normalizeFrontendUrl(raw) {
    let url = String(raw || "").trim();
    if (!url) return "";

    url = url.replace(/\/+$/, "");

    if (!/^https?:\/\//i.test(url)) {
        if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(url)) {
            url = `http://${url}`;
        } else {
            url = `https://${url}`;
        }
    }

    return url;
}

export function getFrontendBase() {
    const raw = (process.env.FRONTEND_URL || "").trim();
    if (!raw) return "http://localhost:5173";

    const candidates = raw
        .split(",")
        .map((part) => normalizeFrontendUrl(part))
        .filter(Boolean);

    if (candidates.length === 0) return "http://localhost:5173";
    if (candidates.length === 1) return candidates[0];

    const isProd = process.env.NODE_ENV === "production";

    // Email links should open on any device — prefer the public https URL when multiple are set.
    const httpsUrl = candidates.find((url) => url.startsWith("https://"));
    if (httpsUrl && (isProd || candidates.length > 1)) {
        return httpsUrl;
    }

    if (isProd) {
        const httpsUrl = candidates.find((url) => url.startsWith("https://"));
        if (httpsUrl) return httpsUrl;
    }

    const localUrl = candidates.find((url) => /localhost|127\.0\.0\.1/i.test(url));
    if (localUrl) return localUrl;

    return candidates[0];
}
