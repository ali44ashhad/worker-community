import { S3_FOLDERS, uploadBufferToS3 } from "./s3Upload.js";

/** Keep only real S3 portfolio images (drops empty / non-S3 placeholders). */
export function stripInvalidPortfolioImages(images) {
    return (Array.isArray(images) ? images : []).filter(
        (img) => img?.url && img?.public_id
    );
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function wrapTextLines(text, maxCharsPerLine = 18) {
    const words = String(text || "Service")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const lines = [];
    let current = "";

    for (const word of words) {
        if (word.length > maxCharsPerLine) {
            if (current) {
                lines.push(current);
                current = "";
            }
            for (let i = 0; i < word.length; i += maxCharsPerLine) {
                lines.push(word.slice(i, i + maxCharsPerLine));
            }
            continue;
        }

        const next = current ? `${current} ${word}` : word;
        if (next.length <= maxCharsPerLine) {
            current = next;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines.length ? lines.slice(0, 6) : ["Service"];
}

/**
 * White SVG cover with the service name (no native deps).
 * Uploaded to S3 when the client does not send portfolio images.
 */
function buildServiceNameCoverFile(serviceName) {
    const text = String(serviceName || "Service").trim() || "Service";
    const lines = wrapTextLines(text);
    const fontSize = lines.length >= 4 ? 48 : lines.length === 3 ? 56 : 72;
    const lineHeight = fontSize * 1.25;
    const blockHeight = lines.length * lineHeight;
    const startY = 245 - blockHeight / 2 + lineHeight / 2;

    const tspans = lines
        .map((line, index) => {
            const y = startY + index * lineHeight;
            return `<tspan x="490" y="${y}">${escapeXml(line)}</tspan>`;
        })
        .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="980" height="490" viewBox="0 0 980 490">
  <rect width="980" height="490" fill="#ffffff"/>
  <text fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${tspans}</text>
</svg>`;

    const safeName = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);

    return {
        buffer: Buffer.from(svg, "utf8"),
        mimetype: "image/svg+xml",
        originalname: `${safeName || "service"}-cover.svg`,
    };
}

async function uploadGeneratedServiceCover(serviceName) {
    return uploadBufferToS3(buildServiceNameCoverFile(serviceName), S3_FOLDERS.SERVICE);
}

/** If no real S3 images remain, generate + upload a service-name cover. */
export async function resolveServicePortfolioImages(images, serviceName) {
    const cleaned = stripInvalidPortfolioImages(images);
    if (cleaned.length) return cleaned;
    return [await uploadGeneratedServiceCover(serviceName)];
}
