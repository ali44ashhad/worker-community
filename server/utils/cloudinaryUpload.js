import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const CLOUDINARY_FOLDERS = {
    PROFILE: "profile_images",
    SERVICE: "service_offerings",
    CATEGORY: "category_images",
};

/**
 * Upload a buffer to Cloudinary.
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export function uploadBufferToCloudinary(buffer, folder = CLOUDINARY_FOLDERS.SERVICE) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

export function extractPublicIdFromUrl(url) {
    try {
        if (!url || typeof url !== "string") return null;
        const marker = "/upload/";
        const idx = url.indexOf(marker);
        if (idx === -1) return null;
        let path = url.slice(idx + marker.length);
        path = path.replace(/^v\d+\//, "");
        path = path.replace(/\.[^/.]+$/, "");
        return path || null;
    } catch {
        return null;
    }
}

export function deleteFromCloudinary(public_id) {
    if (!public_id) return Promise.resolve();
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(public_id, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

/** Best-effort delete; logs and swallows errors (cleanup paths). */
export async function deleteFromCloudinarySafe(public_id) {
    if (!public_id) return;
    try {
        await deleteFromCloudinary(public_id);
    } catch (error) {
        console.log("Cloudinary cleanup failed:", error?.message || error);
    }
}

export async function deleteCloudinaryAssetByUrl(url) {
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) return;
    await deleteFromCloudinarySafe(publicId);
}
