export const EVENT_TOGGLE_KEYS = [
    "communityMeetup",
    "marketDay",
    "workshop",
    "sports",
    "fundraiser",
];

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

export const hasAnyEventEnabled = (toggles) =>
    EVENT_TOGGLE_KEYS.some((key) => Boolean(toggles?.[key]));
