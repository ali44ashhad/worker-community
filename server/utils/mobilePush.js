import admin from "firebase-admin";
import MobilePushDevice from "../models/mobilePushDevice.model.js";

let mobilePushInitAttempted = false;

function normalizePrivateKey(raw) {
    return String(raw || "").replace(/\\n/g, "\n").trim();
}

function getFirebaseCredentials() {
    const projectId = String(process.env.FIREBASE_PROJECT_ID || "").trim();
    const clientEmail = String(process.env.FIREBASE_CLIENT_EMAIL || "").trim();
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");

    if (!projectId || !clientEmail || !privateKey) return null;
    return { projectId, clientEmail, privateKey };
}

export function isMobilePushConfigured() {
    return Boolean(getFirebaseCredentials());
}

function ensureFirebaseAdmin() {
    if (admin.apps.length > 0) return admin.app();
    if (mobilePushInitAttempted && admin.apps.length === 0) return null;

    mobilePushInitAttempted = true;
    const creds = getFirebaseCredentials();
    if (!creds) {
        console.error(
            "[push] Firebase mobile push not configured — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
        );
        return null;
    }

    return admin.initializeApp({
        credential: admin.credential.cert(creds),
    });
}

export async function registerMobileDevice(userId, { token, platform, appId = "", deviceId = "", userAgent = "" }) {
    const normalizedPlatform = String(platform || "").trim().toLowerCase();
    if (!["android", "ios"].includes(normalizedPlatform)) {
        throw new Error("platform must be android or ios");
    }

    await MobilePushDevice.findOneAndUpdate(
        { token: String(token).trim() },
        {
            user: userId,
            token: String(token).trim(),
            platform: normalizedPlatform,
            appId: String(appId || "").trim().slice(0, 200),
            deviceId: String(deviceId || "").trim().slice(0, 200),
            userAgent: String(userAgent || "").trim().slice(0, 500),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}

export async function unregisterMobileDevice(userId, token) {
    await MobilePushDevice.deleteOne({ user: userId, token: String(token || "").trim() });
}

export async function countMobileDevices(userId) {
    return MobilePushDevice.countDocuments({ user: userId });
}

function buildFirebaseMessage(token, { title, body, url, tag, data = {}, platform }) {
    const message = {
        token,
        notification: {
            title: title || "CommuN",
            body: body || "",
        },
        data: {
            title: title || "CommuN",
            body: body || "",
            url: String(url || "/"),
            tag: String(tag || "commun"),
            ...Object.fromEntries(
                Object.entries(data || {}).map(([key, value]) => [key, String(value ?? "")])
            ),
        },
        android: {
            priority: "high",
            notification: {
                channelId: process.env.FCM_ANDROID_CHANNEL_ID || "default",
                clickAction: "OPEN_COMMUN_NOTIFICATION",
                tag: String(tag || "commun"),
            },
        },
        apns: {
            headers: {
                "apns-priority": "10",
            },
            payload: {
                aps: {
                    sound: "default",
                    badge: 1,
                    "mutable-content": 1,
                    category: "OPEN_COMMUN_NOTIFICATION",
                },
            },
        },
    };

    if (platform === "ios") {
        message.apns.headers["apns-push-type"] = "alert";
    }

    return message;
}

export async function sendMobilePushToUsers(userIds, payload) {
    const ids = [...new Set((userIds || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) return { sent: 0, failed: 0 };

    const app = ensureFirebaseAdmin();
    if (!app) return { sent: 0, failed: 0 };

    const devices = await MobilePushDevice.find({ user: { $in: ids } }).lean();
    if (!devices.length) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;
    const staleTokens = [];

    await Promise.all(
        devices.map(async (device) => {
            try {
                const message = buildFirebaseMessage(device.token, { ...payload, platform: device.platform });
                await admin.messaging().send(message);
                sent += 1;
            } catch (err) {
                failed += 1;
                const code = err?.errorInfo?.code || err?.code || "";
                if (
                    code === "messaging/registration-token-not-registered" ||
                    code === "messaging/invalid-registration-token"
                ) {
                    staleTokens.push(device.token);
                } else {
                    console.error("[push] mobile send failed:", err?.message || err);
                }
            }
        })
    );

    if (staleTokens.length) {
        await MobilePushDevice.deleteMany({ token: { $in: staleTokens } });
    }

    return { sent, failed };
}
