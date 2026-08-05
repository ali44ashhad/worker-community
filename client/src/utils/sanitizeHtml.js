import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'span',
];

const ALLOWED_ATTR = ['style', 'class'];

/**
 * Sanitize rich-text HTML for safe rendering (XSS protection).
 */
export function sanitizeRichTextHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * True when HTML has visible text content.
 */
export function hasRichTextContent(html) {
  if (!html || typeof html !== 'string') return false;
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return Boolean(text);
}
