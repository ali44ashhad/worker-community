import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { Pencil, Search, Trash2, X } from 'lucide-react';
import { getFullName, getUserCommunityLabel } from '../utils/userHelpers';
import { formatCommunDisplayName } from '../utils/communName';
import ProfileAvatar from './ProfileAvatar';

const PAGE_SIZE = 12;
const FETCH_LIMIT = 1000;

const starClass = (filled) => (filled ? 'text-amber-400' : 'text-purple-100');

const MetaRow = ({ label, value }) => (
  <p className="text-sm text-[var(--text-secondary)]">
    <span className="font-medium text-[var(--text-primary)]">{label}:</span> {value || '—'}
  </p>
);

const StarRow = ({ rating, size = 'text-sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar key={star} className={`${size} ${starClass(star <= (rating || 0))}`} />
    ))}
  </div>
);

const ReviewModerationPanel = ({
  roleLabel = 'Admin',
  title = 'Reviews',
  description,
  reviews = [],
  loading = false,
  error = null,
  needsCommunName = false,
  communityCommunName = null,
  onFetch,
  onUpdate,
  onDelete,
  updating = false,
  deletingId = null,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [deleteReview, setDeleteReview] = useState(null);

  useEffect(() => {
    onFetch?.({ page: 1, limit: FETCH_LIMIT, search: '' });
  }, [onFetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const reviewerLabel = (review) => {
    if (!review.customer) return 'Deleted user';
    return getFullName(review.customer);
  };

  const serviceLabel = (review) => {
    const s = review.serviceOffering;
    if (!s) return 'Deleted service';
    if (s.servicename) return s.servicename;
    if (s.serviceCategory) return s.serviceCategory;
    if (s.missingService) return 'Deleted service';
    return 'Service';
  };

  const providerLabel = (review) => {
    const providerUser = review.serviceOffering?.provider?.user;
    if (!providerUser) return 'Deleted provider';
    return getFullName(providerUser);
  };

  const communityLabel = (value) =>
    value ? formatCommunDisplayName(value) : 'No community / public';

  const filteredReviews = useMemo(() => {
    const sorted = [...(reviews || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    if (!searchTerm) return sorted;

    return sorted.filter((review) => {
      const haystack = [
        reviewerLabel(review),
        review.customer?.email,
        review.reviewerCommunity,
        getUserCommunityLabel(review.customer),
        serviceLabel(review),
        review.serviceOffering?.serviceCategory,
        providerLabel(review),
        review.providerCommunity,
        getUserCommunityLabel(review.serviceOffering?.provider?.user),
        review.comment,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(searchTerm);
    });
  }, [reviews, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageReviews = filteredReviews.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  // Keep detail popup in sync after edit
  useEffect(() => {
    if (!selectedReview?._id) return;
    const fresh = reviews.find((r) => r._id === selectedReview._id);
    if (fresh) setSelectedReview(fresh);
    else setSelectedReview(null);
  }, [reviews, selectedReview?._id]);

  const openEdit = (review) => {
    setEditReview(review);
    setEditText(review.comment || '');
    setEditRating(review.rating || 5);
  };

  const closeEdit = () => {
    setEditReview(null);
    setEditText('');
    setEditRating(5);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editReview?._id) return;
    const result = await onUpdate?.({
      commentId: editReview._id,
      comment: editText.trim(),
      rating: editRating,
    });
    if (result !== false) closeEdit();
  };

  const confirmDelete = async () => {
    if (!deleteReview?._id) return;
    const id = deleteReview._id;
    const result = await onDelete?.(id);
    if (result !== false) {
      setDeleteReview(null);
      if (selectedReview?._id === id) setSelectedReview(null);
    }
  };

  const previewText = (text) => {
    const value = String(text || '').trim();
    if (value.length <= 80) return value;
    return `${value.slice(0, 80)}…`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
          {roleLabel}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
          {description}
          {communityCommunName ? (
            <span className="font-medium text-[var(--purple-primary)]">
              {' '}
              ({formatCommunDisplayName(communityCommunName)})
            </span>
          ) : null}
          {filteredReviews.length > 0 ? (
            <span className="text-[var(--text-secondary)]">
              {' '}
              · {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
            </span>
          ) : null}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-purple-100/50 bg-white/80 p-6 shadow-sm shadow-purple-500/5"
      >
        {needsCommunName && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This secretary account has no Commun handle. Ask an admin to set your Commun name so community
            reviews can be matched.
          </p>
        )}

        {!needsCommunName && (
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search reviews…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-purple-100 bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25"
            />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {loading && reviews.length === 0 && !error ? (
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">Loading…</p>
        ) : !needsCommunName && filteredReviews.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-10 text-center text-sm text-[var(--text-secondary)]">
            No reviews found.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-purple-50 overflow-hidden rounded-xl border border-purple-100/60">
            {pageReviews.map((review) => (
              <li key={review._id}>
                <button
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  className="flex w-full items-start gap-3 bg-white/70 px-4 py-3 text-left transition hover:bg-purple-50/50"
                >
                  <ProfileAvatar user={review.customer} size="md" className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate font-semibold text-[var(--text-primary)]">
                        {reviewerLabel(review)}
                      </p>
                      <span className="text-xs text-[var(--text-secondary)]">·</span>
                      <p className="truncate text-sm text-[var(--text-secondary)]">
                        {serviceLabel(review)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-[var(--text-secondary)]">
                        {review.createdAt ? new Date(review.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
                      {previewText(review.comment)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {filteredReviews.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <p className="text-sm text-[var(--text-secondary)]">
              Page {safePage} of {totalPages}
            </p>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedReview && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-purple-100 bg-white p-6 shadow-xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar user={selectedReview.customer} size="lg" className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[var(--text-primary)]">
                      {reviewerLabel(selectedReview)}
                    </h2>
                    <StarRow rating={selectedReview.rating} size="text-base" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-lg p-1 hover:bg-purple-50"
                >
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="space-y-1.5 rounded-xl border border-purple-50 bg-purple-50/30 p-4">
                <MetaRow
                  label="Reviewer community"
                  value={
                    getUserCommunityLabel(selectedReview.customer) ||
                    communityLabel(selectedReview.reviewerCommunity)
                  }
                />
                {selectedReview.customer?.email ? (
                  <MetaRow label="Reviewer email" value={selectedReview.customer.email} />
                ) : null}
                <MetaRow label="Service" value={serviceLabel(selectedReview)} />
                <MetaRow
                  label="Category"
                  value={selectedReview.serviceOffering?.serviceCategory || '—'}
                />
                <MetaRow label="Provider" value={providerLabel(selectedReview)} />
                <MetaRow
                  label="Provider community"
                  value={
                    getUserCommunityLabel(selectedReview.serviceOffering?.provider?.user) ||
                    communityLabel(selectedReview.providerCommunity)
                  }
                />
                <MetaRow
                  label="Submitted"
                  value={
                    selectedReview.createdAt
                      ? new Date(selectedReview.createdAt).toLocaleString()
                      : '—'
                  }
                />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                {selectedReview.comment}
              </p>

              {selectedReview.reply ? (
                <p className="mt-3 rounded-lg border border-purple-50 bg-purple-50/40 px-3 py-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Provider reply: </span>
                  {selectedReview.reply}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(selectedReview)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-purple-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteReview(selectedReview)}
                  disabled={deletingId === selectedReview._id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === selectedReview._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editReview && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border border-purple-100 bg-white p-6 shadow-xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit review</h2>
                <button type="button" onClick={closeEdit} className="rounded-lg p-1 hover:bg-purple-50">
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </div>
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditRating(star)}
                        className="focus:outline-none"
                      >
                        <FaStar className={`h-6 w-6 ${starClass(star <= editRating)}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                    Review text
                  </label>
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-xl border border-purple-100 px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !editText.trim()}
                    className="rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {updating ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteReview && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-purple-100 bg-white p-6 shadow-xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
            >
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Delete review?</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                This permanently removes the review
                {deleteReview.reply ? ' and any provider reply' : ''}. This cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteReview(null)}
                  className="rounded-xl border border-purple-100 px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={Boolean(deletingId)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {deletingId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewModerationPanel;
