import User from "../models/user.model.js";

export const EVENT_TOGGLE_KEYS = [
    "communityMeetup",
    "marketDay",
    "workshop",
    "sports",
    "fundraiser",
];

export const EVENT_TYPE_LABELS = {
    communityMeetup: "Community meetup",
    marketDay: "Market day",
    workshop: "Workshop",
    sports: "Sports",
    fundraiser: "Fundraiser",
};

export const DEFAULT_EVENT_TOGGLES = {
    communityMeetup: true,
    marketDay: false,
    workshop: false,
    sports: false,
    fundraiser: false,
};

export const normalizeEventToggles = (raw) => {
    const out = { ...DEFAULT_EVENT_TOGGLES };
    if (!raw || typeof raw !== "object") return out;
    for (const key of EVENT_TOGGLE_KEYS) {
        if (typeof raw[key] === "boolean") out[key] = raw[key];
    }
    return out;
};

export const isEventTypeEnabled = (toggles, eventType) => {
    const key = String(eventType || "communityMeetup").trim();
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
        return { ok: true, eventType: "communityMeetup" };
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
