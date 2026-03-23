import { FC } from 'react';
import { CourseGQLData } from '../../types/types';
import { useSavedCourses } from '../../hooks/savedCourses';
import { pluralize } from '../../helpers/util';
import './CourseInfo.scss';
import RecentOfferingsTable from '../RecentOfferingsTable/RecentOfferingsTable';

import { IconButton } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface CourseProp {
  course: CourseGQLData;
  disabled?: boolean;
  clampDescription?: number;
}

export const CourseBookmarkButton: FC<CourseProp> = ({ course, disabled = false }) => {
  const { isCourseSaved, toggleSavedCourse } = useSavedCourses();
  const courseIsSaved = isCourseSaved(course);
  return (
    <IconButton className="bookmark-button" onClick={() => toggleSavedCourse(course)} disabled={disabled}>
      {courseIsSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
    </IconButton>
  );
};

export const CourseSynopsis: FC<CourseProp> = ({ course, clampDescription = 0 }) => {
  return (
    <p className="course-synopsis" style={clampDescription ? { WebkitLineClamp: clampDescription } : {}}>
      <b className="title">{course.title}</b>
      <span className="description">{course.description}</span>
    </p>
  );
};

export const PrerequisiteText: FC<CourseProp> = ({ course }) => {
  if (!course.prerequisiteText) return <></>;

  return (
    <p>
      <b>Prerequisites:</b> {course.prerequisiteText}
    </p>
  );
};

export const CorequisiteText: FC<CourseProp> = ({ course }) => {
  if (!course.corequisites) return <></>;

  return (
    <p>
      <b>Corequisites:</b> {course.corequisites}
    </p>
  );
};

export const IncompletePrerequisiteText: FC<{ requiredCourses?: string[] }> = ({ requiredCourses }) => {
  if (!requiredCourses?.length) return;

  return (
    <div className="course-info-warning">
      <div className="warning-primary">
        <WarningAmberIcon className="warning-primary-icon" />
        Prerequisite{pluralize(requiredCourses.length)} Not Met: {requiredCourses.join(', ')}
      </div>
      <div className="warning-hint-italics">
        Already completed? Click the "Credits" tab in the sidebar to add{' '}
        {pluralize(requiredCourses.length, 'these prerequisites', 'this prerequisite')}.
      </div>
    </div>
  );
};

export const PreviousOfferingsRow: FC<CourseProp> = ({ course }) => {
  return (
    <>
      {course.terms && course.terms.length > 0 && (
        <div className="quarter-offerings-section">
          <b>Recent Offerings:</b>
          <RecentOfferingsTable terms={course.terms} size="thin" />
        </div>
      )}
    </>
  );
};
