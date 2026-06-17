import React from 'react';
import { HiOutlineLink, HiOutlinePaperClip, HiOutlineX } from 'react-icons/hi';
import { MAX_EVENT_ATTACHMENTS, countEventAttachments } from '../utils/eventAttachmentForm';

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 transition-all disabled:cursor-not-allowed disabled:opacity-50';

const EventAttachmentFields = ({
  files,
  onFilesChange,
  links,
  onLinksChange,
  disabled = false,
}) => {
  const total = countEventAttachments(files, links);
  const canAddLink = total < MAX_EVENT_ATTACHMENTS;

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const remaining = MAX_EVENT_ATTACHMENTS - links.filter((l) => l.url.trim()).length;
    onFilesChange(picked.slice(0, remaining));
    e.target.value = '';
  };

  const updateLink = (index, field, value) => {
    onLinksChange(links.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addLink = () => {
    if (!canAddLink) return;
    onLinksChange([...links, { url: '', label: '' }]);
  };

  const removeLink = (index) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-purple-100 bg-purple-50/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <HiOutlinePaperClip size={18} className="text-[var(--purple-primary)]" />
            Attachments (optional)
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Add images, PDF, video files, or links. Up to {MAX_EVENT_ATTACHMENTS} total.
          </p>
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {total}/{MAX_EVENT_ATTACHMENTS}
        </span>
      </div>

      <div>
        <label
          htmlFor="event-attachment-files"
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Files
        </label>
        <input
          id="event-attachment-files"
          type="file"
          multiple
          accept="image/*,application/pdf,video/*"
          onChange={handleFileChange}
          disabled={disabled || total >= MAX_EVENT_ATTACHMENTS}
          className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[var(--purple-primary)] file:to-[var(--magenta)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`} className="text-xs text-[var(--text-secondary)]">
                {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <HiOutlineLink size={16} className="text-[var(--purple-primary)]" />
            Links
          </p>
          <button
            type="button"
            onClick={addLink}
            disabled={disabled || !canAddLink}
            className="text-xs font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)] disabled:opacity-50"
          >
            + Add link
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)]">No links added.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                  disabled={disabled}
                />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  placeholder="Label (optional)"
                  className={inputClass}
                  disabled={disabled}
                />
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  disabled={disabled}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-purple-100 text-[var(--text-secondary)] transition-colors hover:border-purple-200 hover:bg-white hover:text-[var(--purple-primary)]"
                  aria-label="Remove link"
                >
                  <HiOutlineX size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttachmentFields;
