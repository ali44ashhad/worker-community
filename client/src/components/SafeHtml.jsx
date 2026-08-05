import React, { useMemo } from 'react';
import { hasRichTextContent, sanitizeRichTextHtml } from '../utils/sanitizeHtml';

/**
 * Renders secretary-authored rich text exactly (after sanitize).
 */
const SafeHtml = ({ html, className = '' }) => {
  const safe = useMemo(() => sanitizeRichTextHtml(html), [html]);

  if (!hasRichTextContent(safe)) return null;

  return (
    <div
      className={`rich-text-content min-w-0 max-w-full break-words text-sm leading-relaxed text-[var(--text-secondary)] ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};

export default SafeHtml;
