function communityKey(user) {
    if (!user) return "";
    if (user.role === "secretary") {
        return String(user.communName || "").trim().toLowerCase();
    }
    return String(user.communityCommunName || "").trim().toLowerCase();
}

/** Phone and street address are visible to an approved member of the same community. */
export function viewerCanSeeProviderContact(viewer, providerUser) {
    if (!viewer || !providerUser) return false;
    if (viewer.isActive === false) return false;
    if (viewer.role === "admin") return true;

    const status = viewer.accountStatus || "approved";
    if (status !== "approved") return false;

    const viewerCommunity = communityKey(viewer);
    const providerCommunity = String(
        providerUser.communityCommunName || providerUser.communName || ""
    )
        .trim()
        .toLowerCase();

    if (!viewerCommunity || !providerCommunity) return false;
    return viewerCommunity === providerCommunity;
}

export function redactUserContact(user, viewer) {
    if (!user || typeof user !== "object") return user;
    if (viewerCanSeeProviderContact(viewer, user)) return user;
    const copy = { ...user };
    delete copy.phoneNumber;
    delete copy.addressLine1;
    delete copy.addressLine2;
    return copy;
}

export function redactServiceContacts(services, viewer) {
    if (!Array.isArray(services)) return services;
    return services.map((service) => {
        const user = service?.provider?.user;
        if (!user) return service;
        return {
            ...service,
            provider: {
                ...service.provider,
                user: redactUserContact(user, viewer),
            },
        };
    });
}

export function redactProviderContacts(providers, viewer) {
    if (!Array.isArray(providers)) return providers;
    return providers.map((provider) => {
        if (!provider?.user) return provider;
        return {
            ...provider,
            user: redactUserContact(provider.user, viewer),
        };
    });
}
