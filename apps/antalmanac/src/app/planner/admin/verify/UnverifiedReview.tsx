import ReviewCard from '$planner/component/Review/ReviewCard';
import { type ReviewData } from '@packages/planner-types';
import { type FC } from 'react';

interface UnverifiedReviewProps {
    review: ReviewData;
}

const UnverifiedReview: FC<UnverifiedReviewProps> = ({ review }) => {
    return <ReviewCard review={review} />;
};

export default UnverifiedReview;
