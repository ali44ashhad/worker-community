import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReviewModerationPanel from '../../components/ReviewModerationPanel';
import {
  fetchAdminReviews,
  updateAdminReview,
  deleteAdminReview,
} from '../../features/adminSlice';

const AdminReviews = () => {
  const dispatch = useDispatch();
  const {
    reviews,
    reviewsLoading,
    reviewsError,
    reviewUpdating,
    reviewDeletingId,
  } = useSelector((state) => state.admin);

  const onFetch = useCallback(
    (params) => {
      dispatch(fetchAdminReviews(params));
    },
    [dispatch]
  );

  const onUpdate = useCallback(
    async (payload) => {
      const result = await dispatch(updateAdminReview(payload));
      return updateAdminReview.fulfilled.match(result);
    },
    [dispatch]
  );

  const onDelete = useCallback(
    async (commentId) => {
      const result = await dispatch(deleteAdminReview(commentId));
      return deleteAdminReview.fulfilled.match(result);
    },
    [dispatch]
  );

  return (
    <ReviewModerationPanel
      roleLabel="Admin"
      title="Reviews Mgmt"
      description="View, edit, or delete any review across the site."
      reviews={reviews}
      loading={reviewsLoading}
      error={reviewsError}
      onFetch={onFetch}
      onUpdate={onUpdate}
      onDelete={onDelete}
      updating={reviewUpdating}
      deletingId={reviewDeletingId}
    />
  );
};

export default AdminReviews;
