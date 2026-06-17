import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import EventAttachmentFields from './EventAttachmentFields';
import {
  getMaxExpiryDateInput,
  getMinExpiryDateInput,
  MAX_EVENT_DAYS,
} from '../utils/communityEventDates';

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 transition-all disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'mb-1.5 block text-xs font-medium text-[var(--text-secondary)]';
const btnPrimary =
  'rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnSecondary =
  'rounded-xl border border-purple-100 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:border-purple-200 hover:bg-purple-50 disabled:opacity-50';

const emptyForm = () => ({
  title: '',
  description: '',
  expiresAt: getMinExpiryDateInput(),
  attachmentFiles: [],
  attachmentLinks: [],
});

const CreateEventModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  disabledMessage = '',
  heading = 'New event',
  subheading = `Set an expiry date up to ${MAX_EVENT_DAYS} days from today. Expired events are hidden from members.`,
  submitLabel = 'Create event',
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled || isSubmitting) return;

    const success = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      expiresAt: form.expiresAt,
      files: form.attachmentFiles,
      links: form.attachmentLinks,
    });

    if (success) {
      setForm(emptyForm());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-purple-100/50 bg-white/95 shadow-xl shadow-purple-500/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
          >
            <div className="flex items-start justify-between gap-3 border-b border-purple-100/60 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                  Event
                </p>
                <h2 id="create-event-title" className="text-lg font-bold text-[var(--text-primary)]">
                  {heading}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{subheading}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-purple-50 hover:text-[var(--purple-primary)]"
                aria-label="Close"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-4 overflow-y-auto p-5">
                {disabled && disabledMessage && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {disabledMessage}
                  </p>
                )}

                <div>
                  <label htmlFor="create-event-title-input" className={labelClass}>
                    Title *
                  </label>
                  <input
                    id="create-event-title-input"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Sunday community meetup"
                    maxLength={120}
                    required
                    disabled={disabled || isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="create-event-description" className={labelClass}>
                    Description *
                  </label>
                  <textarea
                    id="create-event-description"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className={`${inputClass} min-h-[120px] resize-y`}
                    placeholder="What is happening, where, and who should join?"
                    maxLength={2000}
                    required
                    disabled={disabled || isSubmitting}
                  />
                  <p className="mt-1 text-right text-xs text-[var(--text-secondary)]">
                    {form.description.length}/2000
                  </p>
                </div>

                <div>
                  <label htmlFor="create-event-expires" className={labelClass}>
                    Expiry date *
                  </label>
                  <input
                    id="create-event-expires"
                    type="date"
                    value={form.expiresAt}
                    min={getMinExpiryDateInput()}
                    max={getMaxExpiryDateInput()}
                    onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    className={inputClass}
                    required
                    disabled={disabled || isSubmitting}
                  />
                </div>

                <EventAttachmentFields
                  files={form.attachmentFiles}
                  onFilesChange={(attachmentFiles) =>
                    setForm((prev) => ({ ...prev, attachmentFiles }))
                  }
                  links={form.attachmentLinks}
                  onLinksChange={(attachmentLinks) =>
                    setForm((prev) => ({ ...prev, attachmentLinks }))
                  }
                  disabled={disabled || isSubmitting}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-purple-100/60 bg-purple-50/30 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    disabled ||
                    isSubmitting ||
                    !form.title.trim() ||
                    !form.description.trim() ||
                    !form.expiresAt
                  }
                  className={btnPrimary}
                >
                  {isSubmitting ? 'Creating…' : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;
