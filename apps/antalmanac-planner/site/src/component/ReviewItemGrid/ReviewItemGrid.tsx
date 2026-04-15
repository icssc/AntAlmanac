import { FC, Children } from 'react';
import './ReviewItemGrid.scss';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface ReviewItemGridProps {
  title: string;
  description: string;
  isLoading: boolean;
  noDataMsg: string;
  children: React.ReactNode;
}

const ReviewItemGrid: FC<ReviewItemGridProps> = ({ title, description, isLoading, noDataMsg, children }) => {
  return (
    <div className="content-wrapper">
      <h1 className="review-grid-title">{title}</h1>
      <p>{description}</p>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="review-grid">
          {Children.toArray(children).length === 0 ? <span>{noDataMsg}</span> : children}
        </div>
      )}
    </div>
  );
};

export default ReviewItemGrid;
