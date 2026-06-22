export const normalizeCategoryToggles = (raw) => {
    if (!raw) return {};
    if (raw instanceof Map) {
        return Object.fromEntries(raw);
    }
    if (typeof raw !== "object") return {};
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
        const name = String(key || "").trim();
        if (!name) continue;
        if (typeof value === "boolean") out[name] = value;
    }
    return out;
};

export const isCategoryEnabled = (toggles, categoryName) => {
    const key = String(categoryName || "").trim();
    if (!key) return false;
    if (!toggles || typeof toggles !== "object") return true;
    if (Object.prototype.hasOwnProperty.call(toggles, key)) {
        return Boolean(toggles[key]);
    }
    return true;
};

export const resolveEnabledCategoryNames = (toggles, availableCategoryNames = []) => {
    return availableCategoryNames.filter((name) => isCategoryEnabled(toggles, name));
};
