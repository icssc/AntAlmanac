import React, { FC, useEffect, useState } from 'react';
import './Course.scss';

import RecentOfferingsTooltip from '../../../component/RecentOfferingsTooltip/RecentOfferingsTooltip';
import CoursePopover from '../../../component/CoursePopover/CoursePopover';
import OverlayTrigger from '../../../component/OverlayTrigger/OverlayTrigger';

import { useIsMobile, pluralize, formatGEsTag, shortenCourseLevel } from '../../../helpers/util';
import { QuarterName } from '@peterportal/types';
import { CourseGQLData, PlannerCourseData } from '../../../types/types';
import { setActiveCourse, setShowAddCourse, setActiveMissingPrerequisites } from '../../../store/slices/roadmapSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { IconButton } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import UnitsContainer from '../CustomUnitsContainer';
import { CourseBookmarkButton, CourseSynopsis } from '../../../component/CourseInfo/CourseInfo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CourseNameAndInfoProps {
  data: CourseGQLData | string;
  popupListener?: (open: boolean) => void;
  openPopoverLeft?: boolean;
  requiredCourses?: string[];
  termMismatch?: QuarterName | 'RecentYears';
  /** Whether to always collapse whitespace in the course name */
  alwaysCollapse?: boolean;
}
export const CourseNameAndInfo: React.FC<CourseNameAndInfoProps> = (props) => {
  const { data, openPopoverLeft, requiredCourses, termMismatch, popupListener, alwaysCollapse } = props;
  const { department, courseNumber } = typeof data === 'string' ? { department: data, courseNumber: '' } : data;

  const showSearch = useAppSelector((state) => state.roadmap.showMobileCatalog);
  const isMobile = useIsMobile();
  const router = useRouter();

  const encodedCourseTitle = encodeURIComponent(department.replace(/\s+/g, '') + courseNumber.replace(/\s+/g, ''));
  const courseRoute = '/course/' + encodedCourseTitle;
  let courseID = department + ' ' + courseNumber;
  if (alwaysCollapse) courseID = courseID.replace(/\s/g, '');

  const handleLinkClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isMobile && showSearch) return;
    const courseKey = typeof data === 'string' ? courseID : data.id;
    router.push(`?course=${encodeURIComponent(courseKey)}`);
  };

  const popoverContent = <CoursePopover course={data} requiredCourses={requiredCourses} termMismatch={termMismatch} />;

  return (
    <OverlayTrigger
      popoverContent={popoverContent}
      popupListener={popupListener}
      disabled={isMobile}
      anchor={openPopoverLeft ? 'left' : 'right'}
      transform={openPopoverLeft ? 'left' : 'right'}
    >
      <span>
        <Link className="name" href={courseRoute} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
          {courseID}
        </Link>
        <span className="warning-container">
          {requiredCourses && <WarningAmberIcon />}
          {termMismatch && <WarningAmberIcon className="warning-secondary" />}
        </span>
      </span>
    </OverlayTrigger>
  );
};

interface CourseProps {
  requiredCourses?: string[];
  termMismatch?: QuarterName | 'RecentYears';
  onDelete?: () => void;
  openPopoverLeft?: boolean;
  addMode?: 'tap' | 'drag';
  data: PlannerCourseData;
  onSetVariableUnits?: (units: number | undefined) => void;
}

const Course: FC<CourseProps> = (props) => {
  const { title, courseLevel, minUnits, maxUnits, terms, geList, userChosenUnits } = props.data;
  const { requiredCourses, termMismatch, onDelete, openPopoverLeft, onSetVariableUnits } = props;

  const isInRoadmap = !!onDelete;
  const isMobile = useIsMobile();

  const formattedCourseLevel = shortenCourseLevel(courseLevel);
  const geTags = formatGEsTag(geList);

  const dispatch = useAppDispatch();

  const insertCourseOnClick = () => {
    dispatch(setActiveCourse({ course: props.data }));
    dispatch(setActiveMissingPrerequisites(requiredCourses));
    dispatch(setShowAddCourse(true));
  };

  const tapProps = { onClick: insertCourseOnClick, role: 'button', tabIndex: 0 };
  const tappableCourseProps = props.addMode === 'tap' ? tapProps : {};

  /**
   * @todo merge conflict with variable units - when merging with var units, this
   * text should be used in course tags, but not in the course-card-top in the Roadmap
   */
  const defaultUnitsText = `${minUnits === maxUnits ? minUnits : `${minUnits}-${maxUnits}`} unit${pluralize(maxUnits)}`;
  const [unit, setUnit] = useState(userChosenUnits ?? undefined);

  useEffect(() => {
    setUnit(userChosenUnits ?? undefined);
  }, [userChosenUnits]);

  return (
    <div className={`course ${isInRoadmap ? 'roadmap-course' : ''}`} {...tappableCourseProps}>
      {(!isMobile || isInRoadmap) && (
        <div className="course-drag-handle">
          <DragIndicatorIcon />
        </div>
      )}

      <div className="course-card-top">
        <div className="course-and-info">
          <span className={`${requiredCourses ? 'missing-prereq' : ''}`}>
            <CourseNameAndInfo data={props.data} {...{ openPopoverLeft, requiredCourses, termMismatch }} />
          </span>
          {isInRoadmap && minUnits === maxUnits && <span className="units">{defaultUnitsText}</span>}
          {isInRoadmap && minUnits !== maxUnits && (
            <div className="custom-units">
              <UnitsContainer
                units={unit}
                setUnits={onSetVariableUnits}
                minUnits={minUnits}
                maxUnits={maxUnits}
                source="Course"
              />
            </div>
          )}
        </div>
        {isInRoadmap ? (
          <IconButton className="course-delete-btn" onClick={onDelete} aria-label="delete">
            <DeleteOutlineIcon className="course-delete-icon" />
          </IconButton>
        ) : (
          <CourseBookmarkButton course={props.data} />
        )}
      </div>
      {isInRoadmap ? (
        <div className="title">{title}</div>
      ) : (
        <div className="course-info">
          <CourseSynopsis course={props.data} clampDescription={3} />
          <div className="course-tags">
            {`${defaultUnitsText} • ${formattedCourseLevel} • ${geTags.length > 0 ? geTags + ' • ' : ''}`}
            <RecentOfferingsTooltip terms={terms} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
