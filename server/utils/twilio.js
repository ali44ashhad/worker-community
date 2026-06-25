import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_SERVICE_SID;

let client = null;

function getClient() {
    if (!client && accountSid && authToken) {
        client = twilio(accountSid, authToken);
    }
    return client;
}

export function formatPhoneE164(phoneDigits) {
    const digits = String(phoneDigits || "").replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (String(phoneDigits || "").trim().startsWith("+")) return String(phoneDigits).trim();
    return digits ? `+${digits}` : "";
}

export function normalizePhoneDigits(phoneDigits) {
    return String(phoneDigits || "").replace(/\D/g, "").slice(-10);
}

export async function sendPhoneOtp(phoneDigits) {
    const twilioClient = getClient();
    if (!twilioClient || !verifyServiceSid) {
        throw new Error("SMS verification is not configured.");
    }

    const to = formatPhoneE164(phoneDigits);
    if (!to || to.length < 12) {
        throw new Error("Enter a valid 10-digit phone number.");
    }

    await twilioClient.verify.v2.services(verifyServiceSid).verifications.create({
        to,
        channel: "sms",
    });

    return to;
}

export async function verifyPhoneOtp(phoneDigits, code) {
    const twilioClient = getClient();
    if (!twilioClient || !verifyServiceSid) {
        throw new Error("SMS verification is not configured.");
    }

    const to = formatPhoneE164(phoneDigits);
    const check = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
            to,
            code: String(code || "").trim(),
        });

    return check.status === "approved";
}
