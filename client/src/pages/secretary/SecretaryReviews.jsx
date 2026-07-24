import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReviewModerationPanel from '../../components/ReviewModerationPanel';
import {
  fetchSecretaryReviews,
  updateSecretaryReview,
  deleteSecretaryReview,
} from '../../features/secretarySlice';

const SecretaryReviews = () => {
  const dispatch = useDispatch();
  const {
    reviews,
    reviewsLoading,
    reviewsError,
    reviewsMeta,
    reviewUpdating,
    reviewDeletingId,
  } = useSelector((state) => state.secretary);

  const onFetch = useCallback(
    (params) => {
      dispatch(fetchSecretaryReviews(params));
    },
    [dispatch]
  );

  const onUpdate = useCallback(
    async (payload) => {
      const result = await dispatch(updateSecretaryReview(payload));
      return updateSecretaryReview.fulfilled.match(result);
    },
    [dispatch]
  );

  const onDelete = useCallback(
    async (commentId) => {
      const result = await dispatch(deleteSecretaryReview(commentId));
      return deleteSecretaryReview.fulfilled.match(result);
    },
    [dispatch]
  );

  return (
    <ReviewModerationPanel
      roleLabel="Secretary"
      title="Reviews"
      description="Moderate reviews on services from providers in your Commun"
      reviews={reviews}
      loading={reviewsLoading}
      error={reviewsError}
      needsCommunName={reviewsMeta?.needsCommunName}
      communityCommunName={reviewsMeta?.communityCommunName}
      onFetch={onFetch}
      onUpdate={onUpdate}
      onDelete={onDelete}
      updating={reviewUpdating}
      deletingId={reviewDeletingId}
    />
  );
};

export default SecretaryReviews;
