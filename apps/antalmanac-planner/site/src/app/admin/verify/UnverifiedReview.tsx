import { FC } from 'react';
import ReviewCard from '../../../component/Review/ReviewCard';
import { ReviewData } from '@peterportal/types';

interface UnverifiedReviewProps {
    review: ReviewData;
}

const UnverifiedReview: FC<UnverifiedReviewProps> = ({ review }) => {
    return <ReviewCard review={review} />;
};

export default UnverifiedReview;
