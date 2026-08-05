import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "span",
];

/**
 * Sanitize business description HTML before save/serve.
 */
export function sanitizeBusinessDescriptionHtml(html) {
  if (!html || typeof html !== "string") return "";

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      span: ["style", "class"],
      p: ["class"],
      li: ["class"],
      strong: ["class"],
      em: ["class"],
      u: ["class"],
    },
    allowedStyles: {
      span: {
        // Quill highlight / color
        "background-color": [/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        color: [/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
      },
    },
    disallowedTagsMode: "discard",
  }).trim();
}
