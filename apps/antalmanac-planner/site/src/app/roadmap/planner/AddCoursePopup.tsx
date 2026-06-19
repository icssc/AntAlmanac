'use client';
import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  hideMobileCatalog,
  reviseRoadmap,
  selectCurrentPlan,
  setShowAddCourse,
} from '../../../store/slices/roadmapSlice';
import './AddCoursePopup.scss';
import UIOverlay from '../../../component/UIOverlay/UIOverlay';
import { useNamedAcademicTerm } from '../../../hooks/namedAcademicTerm';
import { pluralize } from '../../../helpers/util';
import {
  CourseBookmarkButton,
  CourseSynopsis,
  IncompletePrerequisiteText,
  PrerequisiteText,
  PreviousOfferingsRow,
} from '../../../component/CourseInfo/CourseInfo';

import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { modifyQuarterCourse } from '../../../helpers/roadmapEdits';

const AddCoursePopup: FC = () => {
  const currentYearAndQuarter = useAppSelector((state) => state.roadmap.currentYearAndQuarter);
  const showAddCourse = useAppSelector((state) => state.roadmap.showAddCourse);
  const activeCourse = useAppSelector((state) => state.roadmap.activeCourse);
  const activeMissingPrerequisites = useAppSelector((state) => state.roadmap.activeMissingPrerequisites);
  const term = useNamedAcademicTerm();
  const currentPlan = useAppSelector(selectCurrentPlan);

  const dispatch = useAppDispatch();

  const quarterIndex = currentYearAndQuarter?.quarter ?? -1;
  const yearIndex = currentYearAndQuarter?.year ?? -1;

  const closePopup = () => dispatch(setShowAddCourse(false));
  const contentClassName = 'add-course-modal ' + (showAddCourse ? 'enter' : 'exit');
  const overlay = <UIOverlay onClick={closePopup} zIndex={499} />;

  const addToRoadmap = () => {
    const year = currentPlan.content.yearPlans[yearIndex];
    const quarter = year.quarters[quarterIndex];
    const revision = modifyQuarterCourse(currentPlan.id, activeCourse!, null, {
      startYear: year.startYear,
      quarter,
      courseIndex: quarter.courses.length,
    });
    dispatch(reviseRoadmap(revision));

    // hide the search bar to view the roadmap
    dispatch(hideMobileCatalog());
    closePopup();
  };

  if (!activeCourse)
    return (
      <>
        <div className={contentClassName}></div>
        {overlay}
      </>
    );

  const { minUnits, maxUnits, department, courseNumber } = activeCourse;

  return (
    <>
      <div className={contentClassName}>
        <div className="title">
          <h2>
            {department} {courseNumber}
          </h2>
          <span className="unit-count">
            ({minUnits === maxUnits ? minUnits : `${minUnits}-${maxUnits}`} unit{pluralize(maxUnits)})
          </span>
          <CourseBookmarkButton course={activeCourse} />
          <div className="spacer"></div>
          <IconButton onClick={closePopup} className="close-button">
            <CloseIcon />
          </IconButton>
        </div>
        <div className="content">
          <CourseSynopsis course={activeCourse} />
          {activeMissingPrerequisites ? (
            <IncompletePrerequisiteText requiredCourses={activeMissingPrerequisites} />
          ) : (
            <PrerequisiteText course={activeCourse} />
          )}
          <PreviousOfferingsRow course={activeCourse} />
        </div>
        <button className="fixed" onClick={addToRoadmap}>
          Add to {term.quarter} {term.year}
        </button>
      </div>

      {overlay}
    </>
  );
};

export default AddCoursePopup;
