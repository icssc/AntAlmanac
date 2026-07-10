'use client';
import ReviewItemGrid from '$planner/component/ReviewItemGrid/ReviewItemGrid';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { selectReviews, setReviews } from '$planner/store/slices/reviewSlice';
import trpc from '$planner/trpc';
import { type FC, useCallback, useEffect, useState } from 'react';

import UnverifiedReview from './UnverifiedReview';

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

    return (
        <ReviewItemGrid
            title="Unverified Reviews"
            description="Verifying a review will display the review on top of unverified reviews. Deleting a review will remove it permanently."
            isLoading={reviewsLoading}
            noDataMsg="There are currently no unverified reviews."
        >
            {reviews.map((review) => (
                <UnverifiedReview key={`verify-${review.id}`} review={review} />
            ))}
        </ReviewItemGrid>
    );
};

export default Verify;
