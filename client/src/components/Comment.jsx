import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCommentsByService,
  createServiceComment,
  deleteServiceComment,
  updateServiceComment,
} from '../features/commentSlice';

const Comment = ({ serviceId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const commentsState = useSelector((state) => state.comments);
  const comments = commentsState.byServiceId[serviceId] || [];
  const isLoading = commentsState.isLoading;

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (serviceId) {
      dispatch(fetchCommentsByService(serviceId));
    }
  }, [dispatch, serviceId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await dispatch(createServiceComment({ serviceId, comment: trimmed }));
    setText('');
  };

  const onStartEdit = (c) => {
    setEditingId(c._id);
    setEditingText(c.comment);
  };

  const onSaveEdit = async () => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    await dispatch(updateServiceComment({ commentId: editingId, comment: trimmed }));
    setEditingId(null);
    setEditingText('');
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const onDelete = async (id) => {
    await dispatch(deleteServiceComment({ commentId: id }));
  };

  return (
    <div className='mt-10'>
      <div className='bg-white border border-gray-300 rounded-2xl p-5'>
        <h2 className='text-2xl font-bold text-black mb-4'>Comments</h2>

        {/* Form at top */}
        <div className='pb-4 border-b border-gray-300'>
          {user ? (
            <form onSubmit={onSubmit} className='flex flex-col gap-3'>
              <textarea
                className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black'
                rows={3}
                placeholder='Write your comment...'
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type='submit'
                className='self-end px-5 py-2 bg-gray-800 text-white rounded-xl border border-gray-300 hover:bg-gray-700 hover:text-white transition-all'
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className='text-gray-700'>Please login to post a comment.</p>
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
                      <p className='text-xs text-gray-500'>
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {user && c.customer && user._id === c.customer._id && (
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
                    <textarea
                      className='w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-black'
                      rows={3}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                  ) : (
                    <p className='whitespace-pre-wrap'>{c.comment}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Comment;