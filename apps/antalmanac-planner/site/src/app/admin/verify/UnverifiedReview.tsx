import { FC } from 'react';
import ReviewCard from '../../../component/Review/ReviewCard';
import { Button } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckIcon from '@mui/icons-material/Check';
import './UnverifiedReview.scss';
import { ReviewData } from '@peterportal/types';

interface UnverifiedReviewProps {
  review: ReviewData;
  onDelete: () => void;
  onVerify: () => void;
}

const UnverifiedReview: FC<UnverifiedReviewProps> = ({ review, onDelete, onVerify }) => {
  return (
    <ReviewCard review={review}>
      <div className="verification-buttons">
        <Button color="inherit" onClick={onDelete} startIcon={<DeleteForeverIcon />}>
          Delete
        </Button>
        <Button onClick={onVerify} startIcon={<CheckIcon />}>
          Verify
        </Button>
      </div>
    </ReviewCard>
  );
};

export default UnverifiedReview;
