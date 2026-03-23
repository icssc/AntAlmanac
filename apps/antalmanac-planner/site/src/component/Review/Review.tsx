import { FC, useState, useEffect, useCallback } from 'react';
import ReviewCard from './ReviewCard';
import ReviewForm from '../ReviewForm/ReviewForm';
import './Review.scss';

import {
  selectReviews,
  setReviews,
  setFormStatus,
  selectReviewOrder,
  setReviewOrder,
} from '../../store/slices/reviewSlice';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { CourseGQLData, ProfessorGQLData } from '../../types/types';
import { Button, MenuItem, Select, Tooltip } from '@mui/material';
import trpc from '../../trpc';
import { ReviewData } from '@peterportal/types';

import AddIcon from '@mui/icons-material/Add';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';

export interface ReviewProps {
  course?: CourseGQLData;
  professor?: ProfessorGQLData;
  terms?: string[];
}

enum SortingOption {
  MOST_RECENT,
  TOP_REVIEWS,
  CONTROVERSIAL,
}

const Review: FC<ReviewProps> = (props) => {
  const dispatch = useAppDispatch();
  const reviewData = useAppSelector(selectReviews);
  const reviewOrder = useAppSelector(selectReviewOrder);
  const [sortingOption, setSortingOption] = useState<SortingOption>(SortingOption.TOP_REVIEWS);
  const [filterOption, setFilterOption] = useState('');
  const [showOnlyVerifiedReviews, setShowOnlyVerifiedReviews] = useState(false);
  const showForm = useAppSelector((state) => state.review.formOpen);
  const isLoggedIn = useIsLoggedIn();

  const getReviews = useCallback(async () => {
    interface paramsProps {
      courseId?: string;
      professorId?: string;
    }
    const params: paramsProps = {};
    if (props.course) params.courseId = props.course.id;
    if (props.professor) params.professorId = props.professor.ucinetid;
    const reviews = await trpc.reviews.get.query(params);
    dispatch(setReviews(reviews));
    dispatch(setReviewOrder(reviews.map((r) => r.id)));
  }, [dispatch, props.course, props.professor]);

  useEffect(() => {
    // prevent reviews from carrying over
    dispatch(setReviews([]));
    getReviews();
  }, [dispatch, getReviews]);

  let sortedReviews: ReviewData[];
  // filter verified if option is set
  if (showOnlyVerifiedReviews) {
    sortedReviews = reviewData.filter((review) => review.verified);
  } else {
    // if not, clone reviewData since its const
    sortedReviews = reviewData.slice(0);
  }

  // calculate frequencies of professors or courses in list of reviews
  let reviewFreq = new Map<string, number>();
  if (props.course) {
    reviewFreq = sortedReviews.reduce(
      (acc, review) => acc.set(review.professorId, (acc.get(review.professorId) || 0) + 1),
      reviewFreq,
    );
  } else if (props.professor) {
    reviewFreq = sortedReviews.reduce(
      (acc, review) => acc.set(review.courseId, (acc.get(review.courseId) || 0) + 1),
      reviewFreq,
    );
  }

  if (filterOption.length > 0) {
    if (props.course) {
      // filter course reviews by specific professor
      sortedReviews = sortedReviews.filter((review) => review.professorId === filterOption);
    } else if (props.professor) {
      // filter professor reviews by specific course
      sortedReviews = sortedReviews.filter((review) => review.courseId === filterOption);
    }
  }

  switch (sortingOption) {
    case SortingOption.MOST_RECENT:
      sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case SortingOption.TOP_REVIEWS: // the right side of || will fall back to most recent when score is equal
      sortedReviews.sort(
        (a, b) =>
          reviewOrder.indexOf(a.id) - reviewOrder.indexOf(b.id) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case SortingOption.CONTROVERSIAL:
      sortedReviews.sort(
        (a, b) => a.score - b.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }

  const openReviewForm = () => {
    dispatch(setFormStatus(true));
    document.body.style.overflow = 'hidden';
  };
  const closeForm = () => {
    dispatch(setFormStatus(false));
    document.body.style.overflow = 'visible';
  };

  if (!reviewData) {
    return <p>Loading reviews..</p>;
  } else {
    /** @todo refactor. last change was just pulling this out of semantic */
    const reviewSortOptions = [
      { text: 'Most Recent', value: SortingOption.MOST_RECENT },
      { text: 'Top Reviews', value: SortingOption.TOP_REVIEWS },
      { text: 'Controversial', value: SortingOption.CONTROVERSIAL },
    ];

    const professorOptions = [{ text: 'All Instructors', value: '' }].concat(
      Object.keys(props.course?.instructors ?? {})
        .map((profID) => {
          const name = `${props.course?.instructors[profID].name} (${reviewFreq.get(profID) || 0})`;
          return { text: name, value: profID };
        })
        .filter(({ value }) => reviewFreq.get(value))
        .sort((a, b) => a.text.localeCompare(b.text)),
    );
    const courseOptions = [{ text: 'All Courses', value: '' }].concat(
      Object.keys(props.professor?.courses ?? {})
        .map((courseID) => {
          const { department, courseNumber } = props.professor!.courses[courseID];
          const reviewCt = reviewFreq.get(courseID) || 0;
          const name = `${department} ${courseNumber} (${reviewCt})`;
          return { text: name, value: courseID };
        })
        .filter(({ value }) => reviewFreq.get(value))
        .sort((a, b) => a.text.localeCompare(b.text)),
    );

    return (
      <>
        <div className="reviews">
          <div className="sort-filter-menu">
            <div className="sort-dropdown">
              <Select
                value={sortingOption.toString()}
                onChange={(e) => setSortingOption(parseInt(e.target.value as string) as SortingOption)}
              >
                {reviewSortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.text}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {props.course && (
              <div className="filter-dropdown">
                <Select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} displayEmpty>
                  {professorOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.text}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}
            {props.professor && (
              <div className="filter-dropdown">
                <Select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} displayEmpty>
                  {courseOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.text}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            )}

            <div className="verified-only-checkbox">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyVerifiedReviews}
                    onChange={() => setShowOnlyVerifiedReviews((state) => !state)}
                  />
                }
                label="Show verified reviews only"
              />
            </div>
          </div>

          {sortedReviews.length !== 0 && (
            <div className="reviewcards">
              {sortedReviews.map((review) => (
                <ReviewCard review={review} key={review.id} course={props.course} professor={props.professor} />
              ))}
            </div>
          )}
          <Tooltip
            title="You must be logged in to leave a review"
            placement="top"
            open={isLoggedIn ? false : undefined}
          >
            <span className="add-review-button">
              <Button onClick={openReviewForm} disabled={!isLoggedIn}>
                <AddIcon /> Add Review
              </Button>
            </span>
          </Tooltip>
        </div>
        <ReviewForm closeForm={closeForm} show={showForm} {...props} />
      </>
    );
  }
};

export default Review;
