'use client';
import { FC, useCallback, useEffect, useState } from 'react';
import trpc from '../../../trpc';
import ReviewItemGrid from '../../../component/ReviewItemGrid/ReviewItemGrid';
import UnverifiedReview from './UnverifiedReview';
import { selectReviews, setReviews } from '../../../store/slices/reviewSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

const Verify: FC = () => {
  const reviews = useAppSelector(selectReviews);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const getUnverifiedReviews = useCallback(async () => {
    const res = await trpc.reviews.getAdminView.query({ verified: false });
    dispatch(setReviews(res));
    setReviewsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    getUnverifiedReviews();
    document.title = 'Verify Reviews | AntAlmanac Planner';
  }, [getUnverifiedReviews]);

  const verifyReview = async (reviewId: number) => {
    await trpc.reviews.verify.mutate({ id: reviewId });
    dispatch(setReviews(reviews.filter((review) => review.id !== reviewId)));
  };

  const deleteReview = async (reviewId: number) => {
    await trpc.reviews.delete.mutate({ id: reviewId });
    dispatch(setReviews(reviews.filter((review) => review.id !== reviewId)));
  };

  return (
    <ReviewItemGrid
      title="Unverified Reviews"
      description="Verifying a review will display the review on top of unverified reviews. Deleting a review will remove it permanently."
      isLoading={reviewsLoading}
      noDataMsg="There are currently no unverified reviews."
    >
      {reviews.map((review) => (
        <UnverifiedReview
          key={`verify-${review.id}`}
          review={review}
          onDelete={() => deleteReview(review.id)}
          onVerify={() => verifyReview(review.id)}
        />
      ))}
    </ReviewItemGrid>
  );
};

export default Verify;
