import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import {
  fetchCommentsByService,
  createServiceComment,
  deleteServiceComment,
  updateServiceComment,
  addReplyToComment,
  updateReplyToComment,
  deleteReplyToComment,
} from '../features/commentSlice';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const Comment = ({ serviceId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const commentsState = useSelector((state) => state.comments);
  const comments = commentsState.byServiceId[serviceId] || [];
  const serviceProvider = commentsState.serviceProviders[serviceId];
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

  // Check if current user has already reviewed
  const hasUserReviewed = user && comments.some(c => {
    const customerId = typeof c.customer === 'object' ? c.customer?._id : c.customer;
    return customerId === user._id;
  });

  // Check if current user is the provider of this service
  const isProvider = user && serviceProviderUserId && user._id === serviceProviderUserId;

  useEffect(() => {
    if (serviceId) {
      dispatch(fetchCommentsByService(serviceId));
    }
  }, [dispatch, serviceId]);

  // Check if current user is the provider of this service
  useEffect(() => {
    if (!serviceId || !user || user.role !== 'provider') {
      setServiceProviderUserId(null);
      return;
    }

    // Check from serviceProvider data from comments fetch
    if (serviceProvider) {
      const providerUserId = typeof serviceProvider.user === 'object' 
        ? serviceProvider.user._id 
        : serviceProvider.user;
      
      if (providerUserId === user._id) {
        setServiceProviderUserId(providerUserId);
      } else {
        setServiceProviderUserId(null);
      }
      return;
    }

    // Fallback: check from comments if serviceProvider not available
    if (comments.length > 0) {
      // Check if any comment has a provider field populated
      const commentWithProvider = comments.find(c => c.provider && c.provider.user);
      if (commentWithProvider?.provider?.user) {
        const providerUserId = typeof commentWithProvider.provider.user === 'object' 
          ? commentWithProvider.provider.user._id 
          : commentWithProvider.provider.user;
        if (providerUserId === user._id) {
          setServiceProviderUserId(providerUserId);
          return;
        }
      }
      
      // Check if any comment has a reply with replyBy populated
      const commentWithReply = comments.find(c => c.replyBy && c.replyBy.user);
      if (commentWithReply?.replyBy?.user) {
        const providerUserId = typeof commentWithReply.replyBy.user === 'object' 
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
    
    const result = await dispatch(updateServiceComment({ commentId: editingId, comment: trimmed, rating: editingRating }));
    if (updateServiceComment.fulfilled.match(result)) {
      setEditingId(null);
      setEditingText('');
      setEditingRating(0);
      // Refetch comments to ensure all populated data is up to date
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
    await dispatch(deleteServiceComment({ commentId: id }));
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
      // Refetch comments to ensure all populated data is up to date
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
      // Refetch comments to ensure all populated data is up to date
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
        // Refetch comments to ensure all populated data is up to date
        dispatch(fetchCommentsByService(serviceId));
      } else if (deleteReplyToComment.rejected.match(result)) {
        toast.error(result.payload || 'Failed to delete reply');
      }
    }
  };

  return (
    <div className='mt-10'>
      <div className='bg-white border border-gray-300 rounded-2xl p-5'>
        <h2 className='text-2xl font-bold text-black mb-4'>Reviews</h2>

        {/* Form at top */}
        <div className='pb-4 border-b border-gray-300'>
          {user ? (
            hasUserReviewed ? (
              <p className='text-gray-700'>You have already reviewed this service.</p>
            ) : !showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className='px-5 py-2 bg-gray-800 text-white rounded-xl border border-gray-300 hover:bg-gray-700 hover:text-white transition-all'
              >
                Write Review
              </button>
            ) : (
              <form onSubmit={onSubmit} className='flex flex-col gap-3'>
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-medium text-gray-700'>Rating</label>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type='button'
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className='focus:outline-none'
                      >
                        <FaStar
                          className={`text-2xl transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className='text-xs text-gray-500'>{rating} out of 5 stars</p>
                  )}
                </div>
                <textarea
                  className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black'
                  rows={3}
                  placeholder='Write your review...'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className='flex gap-2 self-end'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowReviewForm(false);
                      setText('');
                      setRating(0);
                    }}
                    className='px-5 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-5 py-2 bg-gray-800 text-white rounded-xl border border-gray-300 hover:bg-gray-700 hover:text-white transition-all'
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )
          ) : (
            <p className='text-gray-700'>Please login to post a review.</p>
          )}
        </div>

        {/* Comments below */}
        <div className='mt-4'>
          {isLoading && (
            <div className='mb-4 text-gray-700'>Loading comments...</div>
          )}

          {!isLoading && comments.length === 0 && (
            <div className='mb-4 text-gray-700'>No comments yet. Be the first!</div>
          )}

          <ul className='space-y-4'>
            {comments.map((c) => (
              <li key={c._id} className='border border-gray-300 rounded-xl p-4 bg-white'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    {c.customer?.profileImage ? (
                      <img
                        src={c.customer.profileImage}
                        alt={c.customer?.name || 'User'}
                        className='w-10 h-10 rounded-full border border-gray-300 object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className='w-10 h-10 rounded-full border border-gray-300 bg-gray-700 text-white flex items-center justify-center font-bold'
                      style={{ display: c.customer?.profileImage ? 'none' : 'flex' }}
                    >
                      {(c.customer?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='font-semibold text-black'>
                        {c.customer?.name || 'User'}
                      </p>
                      <div className='flex items-center gap-2'>
                        {c.rating && (
                          <div className='flex items-center gap-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`text-sm ${
                                  star <= c.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <p className='text-xs text-gray-500'>
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user && c.customer && (() => {
                    const customerId = typeof c.customer === 'object' ? c.customer?._id : c.customer;
                    return customerId && user._id === customerId;
                  })() && (
                    <div className='flex gap-2'>
                      {editingId === c._id ? (
                        <>
                          <button
                            onClick={onSaveEdit}
                            className='px-3 py-1 bg-gray-800 text-white rounded-lg border border-gray-300 hover:bg-gray-700 hover:text-white'
                          >
                            Save
                          </button>
                          <button
                            onClick={onCancelEdit}
                            className='px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onStartEdit(c)}
                            className='px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(c._id)}
                            className='px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className='mt-3 text-gray-800'>
                  {editingId === c._id ? (
                    <div className='flex flex-col gap-3'>
                      <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-gray-700'>Rating</label>
                        <div className='flex gap-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type='button'
                              onClick={() => setEditingRating(star)}
                              onMouseEnter={() => setEditingHoveredRating(star)}
                              onMouseLeave={() => setEditingHoveredRating(0)}
                              className='focus:outline-none'
                            >
                              <FaStar
                                className={`text-2xl transition-colors ${
                                  star <= (editingHoveredRating || editingRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {editingRating > 0 && (
                          <p className='text-xs text-gray-500'>{editingRating} out of 5 stars</p>
                        )}
                      </div>
                      <textarea
                        className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black'
                        rows={3}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className='whitespace-pre-wrap'>{c.comment}</p>
                  )}
                </div>

                {/* Reply Section */}
                {c.reply ? (
                  <div className='mt-4 ml-4 pl-4 border-l-2 border-gray-300'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        {(() => {
                          // Handle both populated and unpopulated replyBy structures
                          const replyUser = typeof c.replyBy === 'object' && c.replyBy?.user 
                            ? (typeof c.replyBy.user === 'object' ? c.replyBy.user : null)
                            : null;
                          const profileImage = replyUser?.profileImage;
                          const userName = replyUser?.name || 'Provider';
                          
                          return profileImage ? (
                            <img
                              src={profileImage}
                              alt={userName}
                              className='w-8 h-8 rounded-full border border-gray-300 object-cover'
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : (
                            <div className='w-8 h-8 rounded-full border border-gray-300 bg-gray-700 text-white flex items-center justify-center font-bold text-sm'>
                              {userName.charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <div>
                          <p className='font-semibold text-black text-sm'>
                            {(() => {
                              const replyUser = typeof c.replyBy === 'object' && c.replyBy?.user 
                                ? (typeof c.replyBy.user === 'object' ? c.replyBy.user : null)
                                : null;
                              return replyUser?.name || 'Provider';
                            })()}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {c.replyCreatedAt && new Date(c.replyCreatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isProvider && editingReplyId !== c._id && (
                        <div className='flex gap-2'>
                          <button
                            onClick={() => onStartEditReply(c)}
                            className='px-2 py-1 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteReply(c._id)}
                            className='px-2 py-1 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingReplyId === c._id ? (
                      <div className='mt-3 flex flex-col gap-2'>
                        <textarea
                          className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black text-sm'
                          rows={2}
                          value={editingReplyText}
                          onChange={(e) => setEditingReplyText(e.target.value)}
                        />
                        <div className='flex gap-2 self-end'>
                          <button
                            onClick={onCancelEditReply}
                            className='px-3 py-1 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => onSaveReply(c._id)}
                            className='px-3 py-1 text-xs bg-gray-800 text-white rounded-lg border border-gray-300 hover:bg-gray-700 hover:text-white'
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className='mt-2 text-sm text-gray-800 whitespace-pre-wrap'>{c.reply}</p>
                    )}
                  </div>
                ) : isProvider && replyingToId !== c._id ? (
                  <div className='mt-4 ml-4'>
                    <button
                      onClick={() => setReplyingToId(c._id)}
                      className='text-sm text-gray-600 hover:text-gray-800 underline'
                    >
                      Reply
                    </button>
                  </div>
                ) : isProvider && replyingToId === c._id ? (
                  <div className='mt-4 ml-4 pl-4 border-l-2 border-gray-300'>
                    <div className='flex flex-col gap-2'>
                      <textarea
                        className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black text-sm'
                        rows={2}
                        placeholder='Write your reply...'
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className='flex gap-2 self-end'>
                        <button
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className='px-3 py-1 text-xs bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => onAddReply(c._id)}
                          className='px-3 py-1 text-xs bg-gray-800 text-white rounded-lg border border-gray-300 hover:bg-gray-700 hover:text-white'
                        >
                          Submit Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Comment;