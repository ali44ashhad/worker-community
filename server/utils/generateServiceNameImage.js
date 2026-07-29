import sharp from "sharp";
import { S3_FOLDERS, uploadBufferToS3 } from "./s3Upload.js";

/** 16:9 cover — 1280×720 (same ratio as 1920×1080). */
const COVER_WIDTH = 1280;
const COVER_HEIGHT = 720;

/** Keep only real S3 portfolio images (drops empty / non-S3 placeholders). */
function stripInvalidPortfolioImages(images) {
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

function wrapTextLines(text, maxCharsPerLine = 24) {
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
 * White JPEG cover with the service name (shared by web + app).
 * Built as SVG then rasterized with sharp so both clients get the same format.
 */
async function buildServiceNameCoverFile(serviceName) {
    const text = String(serviceName || "Service").trim() || "Service";
    const lines = wrapTextLines(text);
    const fontSize = lines.length >= 4 ? 64 : lines.length === 3 ? 80 : 96;
    const lineHeight = fontSize * 1.25;
    const blockHeight = lines.length * lineHeight;
    const centerX = COVER_WIDTH / 2;
    const startY = COVER_HEIGHT / 2 - blockHeight / 2 + lineHeight / 2;

    const tspans = lines
        .map((line, index) => {
            const y = startY + index * lineHeight;
            return `<tspan x="${centerX}" y="${y}">${escapeXml(line)}</tspan>`;
        })
        .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}">
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="#ffffff"/>
  <text fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${tspans}</text>
</svg>`;

    const jpegBuffer = await sharp(Buffer.from(svg, "utf8"))
        .jpeg({ quality: 92 })
        .toBuffer();

    const safeName = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);

    return {
        buffer: jpegBuffer,
        mimetype: "image/jpeg",
        originalname: `${safeName || "service"}-cover.jpeg`,
    };
}

async function uploadGeneratedServiceCover(serviceName) {
    return uploadBufferToS3(await buildServiceNameCoverFile(serviceName), S3_FOLDERS.SERVICE);
}

/** If no real S3 images remain, generate + upload a service-name cover. */
export async function resolveServicePortfolioImages(images, serviceName) {
    const cleaned = stripInvalidPortfolioImages(images);
    if (cleaned.length) return cleaned;
    return [await uploadGeneratedServiceCover(serviceName)];
}
