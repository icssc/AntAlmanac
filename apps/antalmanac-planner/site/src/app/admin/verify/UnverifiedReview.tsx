import { ReviewData } from '@peterportal/types';
import { FC } from 'react';

import ReviewCard from '../../../component/Review/ReviewCard';

interface UnverifiedReviewProps {
    review: ReviewData;
}

const UnverifiedReview: FC<UnverifiedReviewProps> = ({ review }) => {
    return <ReviewCard review={review} />;
};

export default UnverifiedReview;
