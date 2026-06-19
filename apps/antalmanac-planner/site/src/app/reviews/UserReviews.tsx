import { FC, useCallback, useEffect, useState } from 'react';
import ReviewCard from '../../component/Review/ReviewCard';
import ReviewItemGrid from '../../component/ReviewItemGrid/ReviewItemGrid';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectReviews, setReviews } from '../../store/slices/reviewSlice';
import trpc from '../../trpc';

const UserReviews: FC = () => {
  const reviews = useAppSelector(selectReviews);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const getUserReviews = useCallback(async () => {
    const response = await trpc.reviews.getUsersReviews.query();
    dispatch(setReviews(response));
    setReviewsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    getUserReviews();
  }, [getUserReviews]);

  return (
    <ReviewItemGrid
      title="Your Reviews"
      description="Deleting a review will remove it permanently."
      isLoading={reviewsLoading}
      noDataMsg="You haven't reviewed any courses yet. Look up a course you've taken to review it!"
    >
      {reviews.map((review) => (
        <ReviewCard key={`user-review-${review.id}`} review={review} />
      ))}
    </ReviewItemGrid>
  );
};

export default UserReviews;
