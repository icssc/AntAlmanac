import { FC } from 'react';
import './HitItem.scss';
import { useRouter } from 'next/navigation';

import { ProfessorGQLData } from '../../types/types';
import { addDelimiter } from '../../helpers/util';
import { CoursePreviewWithTerms } from '@peterportal/types';
import ClickableDiv from '../../component/ClickableDiv/ClickableDiv';

interface ProfessorHitItemProps extends ProfessorGQLData {}

interface RecentlyTaughtListProps {
  courses: CoursePreviewWithTerms[];
}

const RecentlyTaughtList: FC<RecentlyTaughtListProps> = ({ courses }) => {
  const router = useRouter();

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
              router.push(`?course=${encodeURIComponent(c.id)}`);
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
  const router = useRouter();

  const courses = Object.values(props.courses);
  const hasCourses = courses.length > 0;

  const onClickName = () => {
    router.push(`?instructor=${encodeURIComponent(props.ucinetid)}`);
  };

  return (
    <ClickableDiv className="hit-item professor-hit" onClick={onClickName}>
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
    </ClickableDiv>
  );
};

export default ProfessorHitItem;
