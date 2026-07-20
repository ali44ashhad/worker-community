import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.model.js";
import User from "../models/user.model.js";
import InterestCommunityMembership from "../models/interestCommunityMembership.model.js";
import { getFrontendBase } from "./frontendUrl.js";

let configured = false;

function ensureConfigured() {
    if (configured) return true;

    const publicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
    const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
    const subject = (process.env.VAPID_SUBJECT || "mailto:info@commun.in").trim();

    if (!publicKey || !privateKey) {
        console.error(
            "[push] VAPID keys missing — set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY. Push notifications disabled."
        );
        return false;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
    return true;
}

export function getVapidPublicKey() {
    return (process.env.VAPID_PUBLIC_KEY || "").trim();
}

export function isWebPushConfigured() {
    return Boolean((process.env.VAPID_PUBLIC_KEY || "").trim() && (process.env.VAPID_PRIVATE_KEY || "").trim());
}

function buildPayload({ title, body, url = "/", tag, data = {} }) {
    const base = getFrontendBase();
    const absoluteUrl = url.startsWith("http") ? url : `${base}${url.startsWith("/") ? url : `/${url}`}`;

    return JSON.stringify({
        title: title || "CommuN",
        body: body || "",
        icon: "/CommuN-logo-white.png",
        badge: "/CommuN-logo-white.png",
        tag: tag || "commun",
        data: {
            url: absoluteUrl,
            ...data,
        },
    });
}

async function sendToSubscriptions(subscriptions, payload) {
    if (!subscriptions.length || !ensureConfigured()) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;
    const staleIds = [];

    await Promise.all(
        subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys.p256dh,
                            auth: sub.keys.auth,
                        },
                    },
                    payload
                );
                sent += 1;
            } catch (err) {
                failed += 1;
                const status = err?.statusCode || err?.status;
                if (status === 404 || status === 410) {
                    staleIds.push(sub._id);
                } else {
                    console.error("[push] send failed:", err?.message || err);
                }
            }
        })
    );

    if (staleIds.length) {
        await PushSubscription.deleteMany({ _id: { $in: staleIds } });
    }

    return { sent, failed };
}

/**
 * Send a push notification to one or more user IDs.
 */
export async function sendPushToUsers(userIds, { title, body, url, tag, data } = {}) {
    const ids = [...new Set((userIds || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) return { sent: 0, failed: 0 };

    try {
        const subscriptions = await PushSubscription.find({ user: { $in: ids } }).lean();
        if (!subscriptions.length) return { sent: 0, failed: 0 };

        const payload = buildPayload({ title, body, url, tag, data });
        return await sendToSubscriptions(subscriptions, payload);
    } catch (err) {
        console.error("[push] sendPushToUsers:", err?.message || err);
        return { sent: 0, failed: 0 };
    }
}

export async function notifySecretaryNewRegistration({ communityCommunName, memberName }) {
    const handle = String(communityCommunName || "")
        .trim()
        .toLowerCase();
    if (!handle) return;

    const secretaries = await User.find({
        role: "secretary",
        isActive: true,
        communName: handle,
    })
        .select("_id")
        .lean();

    const name = memberName || "A new member";
    await sendPushToUsers(
        secretaries.map((s) => s._id),
        {
            title: "New join request",
            body: `${name} requested to join your community.`,
            url: "/secretary/approvals",
            tag: `join-request-${handle}`,
        }
    );
}

export async function notifyUserRegistrationDecision({ userId, approved, communityCommunName }) {
    const community = communityCommunName || "your community";
    await sendPushToUsers([userId], {
        title: approved ? "Account approved" : "Registration not approved",
        body: approved
            ? `Your registration for ${community} has been approved. You can now use CommuN.`
            : `Your registration for ${community} was not approved. Contact your community secretary if needed.`,
        url: approved ? "/community/services" : "/pending-approval",
        tag: `registration-${approved ? "approved" : "rejected"}`,
    });
}

export async function notifyCommunityMembers({
    communityCommunName,
    excludeUserId,
    title,
    body,
    url,
    tag,
}) {
    const handle = String(communityCommunName || "")
        .trim()
        .toLowerCase();
    if (!handle) return;

    const query = {
        communityCommunName: handle,
        isActive: { $ne: false },
        role: { $in: ["customer", "provider", "secretary"] },
        $or: [{ accountStatus: { $exists: false } }, { accountStatus: "approved" }],
    };

    const members = await User.find(query).select("_id").lean();
    let ids = members.map((m) => String(m._id));
    if (excludeUserId) {
        ids = ids.filter((id) => id !== String(excludeUserId));
    }

    await sendPushToUsers(ids, { title, body, url, tag });
}

export async function notifyInterestGroupMessage({
    interestCommunityId,
    communName,
    authorId,
    authorName,
    text,
    communityName,
}) {
    const handle = String(communName || "")
        .trim()
        .toLowerCase();
    if (!handle || !interestCommunityId) return;

    const memberships = await InterestCommunityMembership.find({
        interestCommunity: interestCommunityId,
        memberCommunName: handle,
        user: { $ne: authorId },
    })
        .select("user")
        .lean();

    const preview = String(text || "")
        .trim()
        .slice(0, 120);
    const groupLabel = communityName || "Community group";

    await sendPushToUsers(
        memberships.map((m) => m.user),
        {
            title: groupLabel,
            body: `${authorName || "Someone"}: ${preview}`,
            url: `/community/communities/${interestCommunityId}/chat`,
            tag: `chat-${interestCommunityId}-${handle}`,
        }
    );
}
