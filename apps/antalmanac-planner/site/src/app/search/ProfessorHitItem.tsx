import { FC } from 'react';
import './HitItem.scss';
import { useAppDispatch } from '../../store/hooks';

import { ProfessorGQLData } from '../../types/types';
import { addPreview, clearPreviews } from '../../store/slices/previewSlice';
import { addDelimiter } from '../../helpers/util';
import { CoursePreviewWithTerms } from '@peterportal/types';

interface ProfessorHitItemProps extends ProfessorGQLData {}

interface RecentlyTaughtListProps {
  courses: CoursePreviewWithTerms[];
}

const RecentlyTaughtList: FC<RecentlyTaughtListProps> = ({ courses }) => {
  const dispatch = useAppDispatch();

  return (
    <>
      {addDelimiter(
        courses.slice(0, 10).map((c) => (
          <a
            key={c.id}
            href={`/course/${c.id}`}
            className="course-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(addPreview({ type: 'course', id: c.id }));
            }}
          >
            {c.department} {c.courseNumber}
          </a>
        )),
        ', ',
      )}
      {courses.length > 10 && ` + ${courses.length - 10} more...`}
    </>
  );
};

const ProfessorHitItem: FC<ProfessorHitItemProps> = (props: ProfessorHitItemProps) => {
  const dispatch = useAppDispatch();

  const courses = Object.values(props.courses);
  const hasCourses = courses.length > 0;

  const onClickName = () => {
    dispatch(clearPreviews());
    dispatch(addPreview({ type: 'instructor', id: props.ucinetid }));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onClickName();
    }
  };

  return (
    <div className="hit-item professor-hit" tabIndex={0} role="button" onClick={onClickName} onKeyDown={onKeyDown}>
      <div className="name-container">
        <div>
          <p className="hit-name">{props.name}</p>
          <p className="hit-subtitle">
            {props.title && <span className="prof-title">{props.title}</span>}

            {props.title && props.department && ' • '}

            {props.department && <span className="prof-department">{props.department}</span>}
          </p>
        </div>
      </div>
      <div className="recent-courses">
        <p className="recent-hit-courses">
          <b>Recently Taught:</b>{' '}
          {hasCourses ? (
            <RecentlyTaughtList courses={courses} />
          ) : (
            <span className="no-courses">No recent courses</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProfessorHitItem;
