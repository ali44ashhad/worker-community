import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";

/** Top-services / top-categories in-memory cache (shared with comment controller). */
const commentListCache = {
    topServices: null,
    topCategories: null,
};

export function getCommentListCache() {
    return commentListCache;
}

export function invalidateCommentCaches() {
    commentListCache.topServices = null;
    commentListCache.topCategories = null;
}

export async function isCommentInCommunity(comment, communityHandle) {
    if (!comment?.serviceOffering || !communityHandle) return false;
    const serviceId =
        typeof comment.serviceOffering === "object"
            ? comment.serviceOffering._id || comment.serviceOffering
            : comment.serviceOffering;
    const service = await ServiceOffering.findById(serviceId).select("provider");
    if (!service) return false;
    const profile = await ProviderProfile.findById(service.provider).populate(
        "user",
        "communityCommunName communName"
    );
    const providerUser = profile?.user;
    if (!providerUser) return false;
    const cn = providerUser.communityCommunName
        ? String(providerUser.communityCommunName).trim().toLowerCase()
        : "";
    const handle = providerUser.communName
        ? String(providerUser.communName).trim().toLowerCase()
        : "";
    return cn === communityHandle || handle === communityHandle;
}
