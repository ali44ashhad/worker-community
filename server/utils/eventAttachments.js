import {
    S3_FOLDERS,
    deleteFromS3Safe,
    uploadBufferToS3,
} from "./s3Upload.js";

export const MAX_EVENT_ATTACHMENTS = 5;

const URL_PATTERN = /^https?:\/\/.+/i;

const attachmentKindFromMime = (mimetype = "") => {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype === "application/pdf") return "pdf";
    if (mimetype.startsWith("video/")) return "video";
    return null;
};

export const parseAttachmentLinks = (raw) => {
    if (!raw) return [];

    let parsed = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(parsed)) return [];

    const links = [];
    for (const item of parsed) {
        const url = String(item?.url || item || "").trim();
        if (!URL_PATTERN.test(url)) continue;
        const name = String(item?.label || item?.name || "").trim().slice(0, 120);
        links.push({
            kind: "link",
            url,
            name: name || url,
            publicId: "",
        });
        if (links.length >= MAX_EVENT_ATTACHMENTS) break;
    }

    return links;
};

export const buildAttachmentsFromRequest = async (req) => {
    const files = Array.isArray(req.files) ? req.files : [];
    const linkAttachments = parseAttachmentLinks(req.body?.attachmentLinks);

    if (files.length + linkAttachments.length > MAX_EVENT_ATTACHMENTS) {
        return {
            ok: false,
            message: `You can add up to ${MAX_EVENT_ATTACHMENTS} attachments (files + links combined).`,
        };
    }

    const attachments = [...linkAttachments];

    for (const file of files) {
        const kind = attachmentKindFromMime(file.mimetype);
        if (!kind) {
            return { ok: false, message: "Unsupported attachment type." };
        }

        const uploaded = await uploadBufferToS3(file, S3_FOLDERS.EVENT);

        attachments.push({
            kind,
            url: uploaded.url,
            name: String(file.originalname || kind).slice(0, 120),
            publicId: uploaded.public_id || "",
        });
    }

    return { ok: true, attachments };
};

export const deleteEventAttachments = async (attachments = []) => {
    for (const item of attachments) {
        if (item?.publicId) {
            await deleteFromS3Safe(item.publicId);
        }
    }
};
