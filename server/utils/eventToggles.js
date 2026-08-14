import User from "../models/user.model.js";

export const DEFAULT_EVENT_TYPE = "communitySocial";

export const EVENT_TOGGLE_KEYS = [
    "communitySocial",
    "sportsFitness",
    "workshopsClasses",
    "kidsFamily",
    "foodLifestyle",
    "exhibitionsPopups",
    "entertainmentCulture",
    "businessProfessional",
    "festivalsCelebrations",
    "communityInitiatives",
    "rwaNotices",
    "other",
];

export const EVENT_TYPE_LABELS = {
    communitySocial: "Community & Social",
    sportsFitness: "Sports & Fitness",
    workshopsClasses: "Workshops & Classes",
    kidsFamily: "Kids & Family",
    foodLifestyle: "Food & Lifestyle",
    exhibitionsPopups: "Exhibitions & Pop-ups",
    entertainmentCulture: "Entertainment & Culture",
    businessProfessional: "Business & Professional",
    festivalsCelebrations: "Festivals & Celebrations",
    communityInitiatives: "Community Initiatives",
    rwaNotices: "RWA / Community Notices",
    other: "Other",
};

/** Old stored keys → current keys (existing events and secretary toggles). */
export const LEGACY_EVENT_TYPE_MAP = {
    communityMeetup: "communitySocial",
    sports: "sportsFitness",
    workshop: "workshopsClasses",
    marketDay: "exhibitionsPopups",
    fundraiser: "communityInitiatives",
};

export const EVENT_TYPE_ENUM = [...EVENT_TOGGLE_KEYS, ...Object.keys(LEGACY_EVENT_TYPE_MAP)];

export const DEFAULT_EVENT_TOGGLES = Object.fromEntries(
    EVENT_TOGGLE_KEYS.map((key) => [key, key === DEFAULT_EVENT_TYPE])
);

export const resolveEventType = (eventType) => {
    const key = String(eventType || DEFAULT_EVENT_TYPE).trim();
    return LEGACY_EVENT_TYPE_MAP[key] || key;
};

export const normalizeEventToggles = (raw) => {
    const out = { ...DEFAULT_EVENT_TOGGLES };
    if (!raw || typeof raw !== "object") return out;

    for (const [legacyKey, currentKey] of Object.entries(LEGACY_EVENT_TYPE_MAP)) {
        if (typeof raw[legacyKey] === "boolean") out[currentKey] = raw[legacyKey];
    }
    for (const key of EVENT_TOGGLE_KEYS) {
        if (typeof raw[key] === "boolean") out[key] = raw[key];
    }
    return out;
};

export const isEventTypeEnabled = (toggles, eventType) => {
    const key = resolveEventType(eventType);
    if (!EVENT_TOGGLE_KEYS.includes(key)) return false;
    return Boolean(normalizeEventToggles(toggles)[key]);
};

export const getEnabledEventTypes = (toggles) =>
    EVENT_TOGGLE_KEYS.filter((key) => isEventTypeEnabled(toggles, key));

export const hasAnyEventTypeEnabled = (toggles) => getEnabledEventTypes(toggles).length > 0;

export function parseEventType(raw, { required = false } = {}) {
    const key = String(raw || "").trim();
    if (!key) {
        if (required) {
            return { ok: false, message: "Event type is required." };
        }
        return { ok: true, eventType: DEFAULT_EVENT_TYPE };
    }
    if (!EVENT_TOGGLE_KEYS.includes(key)) {
        return { ok: false, message: "Invalid event type." };
    }
    return { ok: true, eventType: key };
}

export async function getCommunityEventToggles(communityHandle) {
    const handle = String(communityHandle || "")
        .trim()
        .toLowerCase();
    if (!handle) return normalizeEventToggles();

    const secretary = await User.findOne({
        role: "secretary",
        isActive: true,
        communName: handle,
    })
        .select("eventToggles")
        .lean();

    return normalizeEventToggles(secretary?.eventToggles);
}
