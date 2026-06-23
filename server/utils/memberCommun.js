export function getMemberCommunName(user) {
    if (!user) return "";
    if (user.role === "secretary") {
        return user.communName ? String(user.communName).trim().toLowerCase() : "";
    }
    return user.communityCommunName
        ? String(user.communityCommunName).trim().toLowerCase()
        : user.communName
          ? String(user.communName).trim().toLowerCase()
          : "";
}

export function buildChatRoomId(interestCommunityId, communName) {
    return `${String(interestCommunityId)}:${String(communName).trim().toLowerCase()}`;
}
