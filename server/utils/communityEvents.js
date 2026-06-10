export const MAX_EVENT_DAYS = 30;

export const validateEventExpiry = (raw) => {
    if (!raw) {
        return { ok: false, message: "Expiry date is required." };
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return { ok: false, message: "Invalid expiry date." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDay = new Date(parsed);
    expiryDay.setHours(0, 0, 0, 0);

    const maxDay = new Date(today);
    maxDay.setDate(maxDay.getDate() + MAX_EVENT_DAYS);

    if (expiryDay < today) {
        return { ok: false, message: "Expiry date cannot be in the past." };
    }
    if (expiryDay > maxDay) {
        return { ok: false, message: `Expiry date cannot be more than ${MAX_EVENT_DAYS} days from today.` };
    }

    const expiresAt = new Date(expiryDay);
    expiresAt.setHours(23, 59, 59, 999);

    return { ok: true, expiresAt };
};

export const isEventActive = (event) => {
    if (!event?.expiresAt) return false;
    return new Date(event.expiresAt).getTime() >= Date.now();
};

export const getMaxExpiryDateInput = () => {
    const max = new Date();
    max.setDate(max.getDate() + MAX_EVENT_DAYS);
    return max.toISOString().slice(0, 10);
};

export const getMinExpiryDateInput = () => {
    return new Date().toISOString().slice(0, 10);
};
