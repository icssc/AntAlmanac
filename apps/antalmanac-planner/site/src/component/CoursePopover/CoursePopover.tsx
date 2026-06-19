import { FC } from 'react';
import './CoursePopover.scss';
import { QuarterName } from '@peterportal/types';
import { CourseGQLData } from '../../types/types';
import { pluralize } from '../../helpers/util';
import {
  CorequisiteText,
  CourseSynopsis,
  IncompletePrerequisiteText,
  PrerequisiteText,
  AverageGPAText,
  PreviousOfferingsRow,
  TermMismatchText,
} from '../CourseInfo/CourseInfo';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface CoursePopoverProps {
  course: CourseGQLData | string;
  requiredCourses?: string[];
  termMismatch?: QuarterName | 'RecentYears';
}

const CoursePopover: FC<CoursePopoverProps> = ({ course, requiredCourses, termMismatch }) => {
  if (typeof course === 'string') {
    return (
      <div className="course-popover">
        <LoadingSpinner />
      </div>
    );
  }

  const { department, courseNumber, minUnits, maxUnits } = course;

  return (
    <div className="course-popover">
      <div className="popover-name">
        {department + ' ' + courseNumber + ' '}
        <span className="popover-units">
          ({minUnits === maxUnits ? minUnits : `${minUnits}-${maxUnits}`} {pluralize(maxUnits, 'units', 'unit')})
        </span>
        <div className="spacer" />
      </div>
      <br />
      <CourseSynopsis course={course} clampDescription={4} />
      <PrerequisiteText course={course} clampDescription={4} />
      <CorequisiteText course={course} />
      <IncompletePrerequisiteText requiredCourses={requiredCourses} />
      <AverageGPAText course={course} />
      <PreviousOfferingsRow course={course} />
      <TermMismatchText termMismatch={termMismatch} />
    </div>
  );
};

export default CoursePopover;
