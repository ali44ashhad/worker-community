import { randomUUID } from "crypto";
import path from "path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client, { getS3Bucket, getS3Region } from "../config/s3.js";

export const S3_FOLDERS = {
    PROFILE: "profile_images",
    SERVICE: "service_offerings",
    CATEGORY: "category_images",
    EVENT: "community_events",
};

function encodeS3Key(key) {
    return key.split("/").map(encodeURIComponent).join("/");
}

export function buildS3PublicUrl(key) {
    const bucket = getS3Bucket();
    const region = getS3Region();
    return `https://s3.${region}.amazonaws.com/${bucket}/${encodeS3Key(key)}`;
}

function resolveUploadInput(bufferOrFile, options = {}) {
    if (bufferOrFile?.buffer && Buffer.isBuffer(bufferOrFile.buffer)) {
        return {
            buffer: bufferOrFile.buffer,
            contentType: bufferOrFile.mimetype || options.contentType || "application/octet-stream",
            originalname: bufferOrFile.originalname || options.originalname || "",
        };
    }

    return {
        buffer: bufferOrFile,
        contentType: options.contentType || options.mimetype || "application/octet-stream",
        originalname: options.originalname || "",
    };
}

function buildObjectKey(folder, originalname, contentType) {
    const extFromName = path.extname(originalname || "").toLowerCase();
    if (extFromName) {
        return `${folder}/${randomUUID()}${extFromName}`;
    }

    const typeMap = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "application/pdf": ".pdf",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
    };

    const ext = typeMap[contentType] || "";
    return `${folder}/${randomUUID()}${ext}`;
}

/**
 * Upload a buffer (or multer file) to S3.
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadBufferToS3(bufferOrFile, folder = S3_FOLDERS.SERVICE, options = {}) {
    const { buffer, contentType, originalname } = resolveUploadInput(bufferOrFile, options);
    const key = buildObjectKey(folder, originalname, contentType);

    await s3Client.send(
        new PutObjectCommand({
            Bucket: getS3Bucket(),
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return {
        url: buildS3PublicUrl(key),
        public_id: key,
    };
}

export function extractKeyFromS3Url(url) {
    try {
        if (!url || typeof url !== "string") return null;
        const bucket = getS3Bucket();
        const region = getS3Region();

        const pathStylePrefix = `https://s3.${region}.amazonaws.com/${bucket}/`;
        if (url.startsWith(pathStylePrefix)) {
            return decodeURIComponent(url.slice(pathStylePrefix.length));
        }

        const virtualHostPrefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
        if (url.startsWith(virtualHostPrefix)) {
            return decodeURIComponent(url.slice(virtualHostPrefix.length));
        }

        const legacyVirtualHostPrefix = `https://${bucket}.s3.amazonaws.com/`;
        if (url.startsWith(legacyVirtualHostPrefix)) {
            return decodeURIComponent(url.slice(legacyVirtualHostPrefix.length));
        }

        return null;
    } catch {
        return null;
    }
}

export function deleteFromS3(key) {
    if (!key) return Promise.resolve();
    return s3Client.send(
        new DeleteObjectCommand({
            Bucket: getS3Bucket(),
            Key: key,
        })
    );
}

export async function deleteFromS3Safe(key) {
    if (!key) return;
    try {
        await deleteFromS3(key);
    } catch (error) {
        console.log("S3 cleanup failed:", error?.message || error);
    }
}

export async function deleteS3AssetByUrl(url) {
    const key = extractKeyFromS3Url(url);
    if (key) {
        await deleteFromS3Safe(key);
    }
}

export async function createPresignedUploadUrl({ folder, contentType, filename }) {
    const key = buildObjectKey(folder, filename, contentType || "application/octet-stream");
    const command = new PutObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
        ContentType: contentType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
        uploadUrl,
        key,
        publicUrl: buildS3PublicUrl(key),
        public_id: key,
    };
}
