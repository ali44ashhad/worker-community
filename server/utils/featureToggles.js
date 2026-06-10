export const FEATURE_TOGGLE_KEYS = ["broadcast", "events"];

export const DEFAULT_FEATURE_TOGGLES = {
    broadcast: false,
    events: false,
};

export const normalizeFeatureToggles = (raw) => {
    const out = { ...DEFAULT_FEATURE_TOGGLES };
    if (!raw || typeof raw !== "object") return out;
    for (const key of FEATURE_TOGGLE_KEYS) {
        if (typeof raw[key] === "boolean") out[key] = raw[key];
    }
    return out;
};
