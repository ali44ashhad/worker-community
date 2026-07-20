import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import {
  fetchCommentsByService,
  canReviewService,
  createServiceComment,
  deleteServiceComment,
  updateServiceComment,
  addReplyToComment,
  updateReplyToComment,
  deleteReplyToComment,
} from '../features/commentSlice';
import axios from 'axios';
import { getFullName } from '../utils/userHelpers';
import { getApiBase } from '../utils/apiBase';
import ProfileAvatar from './ProfileAvatar';

const API_URL = getApiBase() || 'http://localhost:3001';
axios.defaults.withCredentials = true;

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';
const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25';
const btnPrimary =
  'rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90';
const btnSecondary =
  'rounded-xl border border-purple-100 bg-white px-5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-purple-200 hover:bg-purple-50';
const btnPrimarySm =
  'rounded-lg bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-3 py-1 text-xs font-semibold text-white transition-all hover:opacity-90';
const btnSecondarySm =
  'rounded-lg border border-purple-100 bg-white px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-purple-200 hover:bg-purple-50';

const starClass = (filled) =>
  filled ? 'text-amber-400' : 'text-purple-100';

const getReplyUser = (comment) => {
  if (typeof comment.replyBy === 'object' && comment.replyBy?.user) {
    return typeof comment.replyBy.user === 'object' ? comment.replyBy.user : null;
  }
  return null;
};

const Comment = ({ serviceId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const commentsState = useSelector((state) => state.comments);
  const comments = useMemo(() => commentsState.byServiceId[serviceId] || [], [commentsState.byServiceId, serviceId]);
  const serviceProvider = commentsState.serviceProviders[serviceId];
  const canReview = commentsState.canReviewByServiceId?.[serviceId];
  const isLoading = commentsState.isLoading;

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(0);
  const [editingHoveredRating, setEditingHoveredRating] = useState(0);
  const [serviceProviderUserId, setServiceProviderUserId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState('');

  const hasUserReviewed =
    user &&
    comments.some((c) => {
      const customerId = typeof c.customer === 'object' ? c.customer?._id : c.customer;
      return customerId === user._id;
    });

  const isProvider = user && serviceProviderUserId && user._id === serviceProviderUserId;

  useEffect(() => {
    if (serviceId) {
      dispatch(fetchCommentsByService(serviceId));
    }
  }, [dispatch, serviceId]);

  useEffect(() => {
    if (serviceId && user) {
      dispatch(canReviewService(serviceId));
    }
  }, [dispatch, serviceId, user]);

  useEffect(() => {
    if (!serviceId || !user || user.role !== 'provider') {
      setServiceProviderUserId(null);
      return;
    }

    if (serviceProvider) {
      const providerUserId =
        typeof serviceProvider.user === 'object' ? serviceProvider.user._id : serviceProvider.user;

      if (providerUserId === user._id) {
        setServiceProviderUserId(providerUserId);
      } else {
        setServiceProviderUserId(null);
      }
      return;
    }

    if (comments.length > 0) {
      const commentWithProvider = comments.find((c) => c.provider && c.provider.user);
      if (commentWithProvider?.provider?.user) {
        const providerUserId =
          typeof commentWithProvider.provider.user === 'object'
            ? commentWithProvider.provider.user._id
            : commentWithProvider.provider.user;
        if (providerUserId === user._id) {
          setServiceProviderUserId(providerUserId);
          return;
        }
      }

      const commentWithReply = comments.find((c) => c.replyBy && c.replyBy.user);
      if (commentWithReply?.replyBy?.user) {
        const providerUserId =
          typeof commentWithReply.replyBy.user === 'object'
            ? commentWithReply.replyBy.user._id
            : commentWithReply.replyBy.user;
        if (providerUserId === user._id) {
          setServiceProviderUserId(providerUserId);
          return;
        }
      }
    }

    setServiceProviderUserId(null);
  }, [serviceId, user, serviceProvider, comments]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating (1-5 stars)');
      return;
    }

    if (!trimmed) {
      toast.error('Please write a review comment');
      return;
    }

    const result = await dispatch(createServiceComment({ serviceId, comment: trimmed, rating }));
    if (createServiceComment.fulfilled.match(result)) {
      setText('');
      setRating(0);
      setShowReviewForm(false);
    } else if (createServiceComment.rejected.match(result)) {
      toast.error(result.payload || 'Failed to submit review');
    }
  };

  const onStartEdit = (c) => {
    setEditingId(c._id);
    setEditingText(c.comment);
    setEditingRating(c.rating || 0);
  };

  const onSaveEdit = async () => {
    const trimmed = editingText.trim();

    if (!editingRating || editingRating < 1 || editingRating > 5) {
      toast.error('Please select a rating (1-5 stars)');
      return;
    }

    if (!trimmed) {
      toast.error('Please write a review comment');
      return;
    }

    const result = await dispatch(
      updateServiceComment({ commentId: editingId, comment: trimmed, rating: editingRating })
    );
    if (updateServiceComment.fulfilled.match(result)) {
      setEditingId(null);
      setEditingText('');
      setEditingRating(0);
      dispatch(fetchCommentsByService(serviceId));
    } else if (updateServiceComment.rejected.match(result)) {
      toast.error(result.payload || 'Failed to update comment');
    }
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditingRating(0);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    const result = await dispatch(deleteServiceComment({ commentId: id }));
    if (deleteServiceComment.fulfilled.match(result)) {
      toast.success('Review deleted.');
      dispatch(fetchCommentsByService(serviceId));
    } else if (deleteServiceComment.rejected.match(result)) {
      toast.error(result.payload || 'Failed to delete review');
    }
  };

  const onAddReply = async (commentId) => {
    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error('Please write a reply');
      return;
    }
    const result = await dispatch(addReplyToComment({ commentId, reply: trimmed }));
    if (addReplyToComment.fulfilled.match(result)) {
      setReplyText('');
      setReplyingToId(null);
      dispatch(fetchCommentsByService(serviceId));
    } else if (addReplyToComment.rejected.match(result)) {
      toast.error(result.payload || 'Failed to add reply');
    }
  };

  const onStartEditReply = (comment) => {
    setEditingReplyId(comment._id);
    setEditingReplyText(comment.reply || '');
  };

  const onSaveReply = async (commentId) => {
    const trimmed = editingReplyText.trim();
    if (!trimmed) {
      toast.error('Please write a reply');
      return;
    }
    const result = await dispatch(updateReplyToComment({ commentId, reply: trimmed }));
    if (updateReplyToComment.fulfilled.match(result)) {
      setEditingReplyId(null);
      setEditingReplyText('');
      dispatch(fetchCommentsByService(serviceId));
    } else if (updateReplyToComment.rejected.match(result)) {
      toast.error(result.payload || 'Failed to update reply');
    }
  };

  const onCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyText('');
  };

  const onDeleteReply = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      const result = await dispatch(deleteReplyToComment({ commentId }));
      if (deleteReplyToComment.fulfilled.match(result)) {
        dispatch(fetchCommentsByService(serviceId));
      } else if (deleteReplyToComment.rejected.match(result)) {
        toast.error(result.payload || 'Failed to delete reply');
      }
    }
  };

  const renderStarPicker = (value, hovered, onSelect, onHover, onLeave, size = 'text-2xl') => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onSelect(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className="focus:outline-none"
        >
          <FaStar className={`${size} transition-colors ${starClass(star <= (hovered || value))}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-10">
      <div className={cardClass}>
        <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">Reviews</h2>

        <div className="border-b border-purple-100/60 pb-4">
          {user ? (
            hasUserReviewed ? (
              <p className="text-sm text-[var(--text-secondary)]">
                You have already reviewed this service.
              </p>
            ) : canReview === false ? (
              <p className="text-sm text-[var(--text-secondary)]">
                You can review only after you book this service.
              </p>
            ) : !showReviewForm ? (
              <button type="button" onClick={() => setShowReviewForm(true)} className={btnPrimary}>
                Write Review
              </button>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Rating</label>
                  {renderStarPicker(rating, hoveredRating, setRating, setHoveredRating, () =>
                    setHoveredRating(0)
                  )}
                  {rating > 0 && (
                    <p className="text-xs text-[var(--text-secondary)]">{rating} out of 5 stars</p>
                  )}
                </div>
                <textarea
                  className={inputClass}
                  rows={3}
                  placeholder="Write your review..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex gap-2 self-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setText('');
                      setRating(0);
                    }}
                    className={btnSecondary}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={btnPrimary}>
                    Submit Review
                  </button>
                </div>
              </form>
            )
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">Please login to post a review.</p>
          )}
        </div>

        <div className="mt-4">
          {isLoading && (
            <div className="mb-4 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
              Loading comments...
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <p className="mb-4 rounded-xl border border-dashed border-purple-100 bg-purple-50/30 py-8 text-center text-sm text-[var(--text-secondary)]">
              No comments yet. Be the first!
            </p>
          )}

          <ul className="space-y-4">
            {comments.map((c) => {
              const replyUser = getReplyUser(c);
              const customerId =
                typeof c.customer === 'object' ? c.customer?._id : c.customer;
              const isOwnReview = user && c.customer && customerId && user._id === customerId;

              return (
                <li
                  key={c._id}
                  className="rounded-xl border border-purple-100/60 bg-white/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar user={c.customer} size="lg" className="shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {getFullName(c.customer) || 'User'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {c.rating && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={`text-sm ${starClass(star <= c.rating)}`}
                                />
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-[var(--text-secondary)]">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isOwnReview && (
                      <div className="flex gap-2">
                        {editingId === c._id ? (
                          <>
                            <button type="button" onClick={onSaveEdit} className={btnPrimarySm}>
                              Save
                            </button>
                            <button type="button" onClick={onCancelEdit} className={btnSecondarySm}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onStartEdit(c)}
                              className={btnSecondarySm}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(c._id)}
                              className={btnSecondarySm}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-[var(--text-primary)]">
                    {editingId === c._id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-[var(--text-secondary)]">
                            Rating
                          </label>
                          {renderStarPicker(
                            editingRating,
                            editingHoveredRating,
                            setEditingRating,
                            setEditingHoveredRating,
                            () => setEditingHoveredRating(0)
                          )}
                          {editingRating > 0 && (
                            <p className="text-xs text-[var(--text-secondary)]">
                              {editingRating} out of 5 stars
                            </p>
                          )}
                        </div>
                        <textarea
                          className={inputClass}
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                        {c.comment}
                      </p>
                    )}
                  </div>

                  {c.reply ? (
                    <div className="ml-4 mt-4 border-l-2 border-purple-200 pl-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar user={replyUser} size="smd" className="shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {getFullName(replyUser) || 'Provider'}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {c.replyCreatedAt && new Date(c.replyCreatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {isProvider && editingReplyId !== c._id && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onStartEditReply(c)}
                              className={btnSecondarySm}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteReply(c._id)}
                              className={btnSecondarySm}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {editingReplyId === c._id ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            className={inputClass}
                            rows={2}
                            value={editingReplyText}
                            onChange={(e) => setEditingReplyText(e.target.value)}
                          />
                          <div className="flex gap-2 self-end">
                            <button
                              type="button"
                              onClick={onCancelEditReply}
                              className={btnSecondarySm}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => onSaveReply(c._id)}
                              className={btnPrimarySm}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                          {c.reply}
                        </p>
                      )}
                    </div>
                  ) : isProvider && replyingToId !== c._id ? (
                    <div className="ml-4 mt-4">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(c._id)}
                        className="text-sm font-medium text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                      >
                        Reply
                      </button>
                    </div>
                  ) : isProvider && replyingToId === c._id ? (
                    <div className="ml-4 mt-4 border-l-2 border-purple-200 pl-4">
                      <div className="flex flex-col gap-2">
                        <textarea
                          className={inputClass}
                          rows={2}
                          placeholder="Write your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex gap-2 self-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                            }}
                            className={btnSecondarySm}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddReply(c._id)}
                            className={btnPrimarySm}
                          >
                            Submit Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Comment;
