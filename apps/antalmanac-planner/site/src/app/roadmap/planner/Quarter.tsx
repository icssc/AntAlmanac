'use client';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { quarterDisplayNames } from '../../../helpers/planner';
import { deepCopy, useIsMobile, pluralize } from '../../../helpers/util';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  createQuarterCourseLoadingPlaceholder,
  reviseRoadmap,
  selectCurrentPlan,
  setActiveCourse,
  showMobileCatalog,
} from '../../../store/slices/roadmapSlice';
import { CourseIdentifier, PlannerQuarterData } from '../../../types/types';
import './Quarter.scss';

import Course from './Course';
import { ReactSortable, SortableEvent } from 'react-sortablejs';
import { quarterSortable } from '../../../helpers/sortable';

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Button, Card } from '@mui/material';
import { ModifiedQuarter, modifyQuarterCourse, reorderQuarterCourse } from '../../../helpers/roadmapEdits';

interface QuarterProps {
  yearIndex: number;
  quarterIndex: number;
  data: PlannerQuarterData;
}

const Quarter: FC<QuarterProps> = ({ yearIndex, quarterIndex, data }) => {
  const dispatch = useAppDispatch();
  const quarterTitle = quarterDisplayNames[data.name];
  const invalidCourses = useAppSelector(
    (state) => state.roadmap.plans[state.roadmap.currentPlanIndex].content.invalidCourses,
  );
  const quarterContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [moveCourseTrigger, setMoveCourseTrigger] = useState<CourseIdentifier | null>(null);
  const activeCourseLoading = useAppSelector((state) => state.roadmap.activeCourseLoading);
  const activeCourse = useAppSelector((state) => state.roadmap.activeCourse);
  const activeCourseDraggedFrom = useAppSelector((state) => state.roadmap.activeCourseDragSource);
  const isDragging = activeCourse !== null;
  const currentPlan = useAppSelector(selectCurrentPlan);
  const startYear = currentPlan.content.yearPlans[yearIndex].startYear;

  const calculateQuarterStats = () => {
    let unitCount = 0;
    let courseCount = 0;
    data.courses.forEach((course) => {
      unitCount += course.minUnits;
      courseCount += 1;
    });
    return [unitCount, courseCount];
  };

  const unitCount = calculateQuarterStats()[0];

  const coursesCopy = deepCopy(data.courses); // Sortable requires data to be extensible (non read-only)

  const removeCourseAt = useCallback(
    (index: number) => {
      const quarterToRemove = { startYear, quarter: data, courseIndex: index };
      const revision = modifyQuarterCourse(currentPlan.id, data.courses[index], quarterToRemove, null);
      dispatch(reviseRoadmap(revision));
    },
    [currentPlan.id, data, dispatch, startYear],
  );

  const addCourse = async (event: SortableEvent) => {
    const target = { yearIndex, quarterIndex, courseIndex: event.newIndex! };
    if (activeCourseLoading) {
      dispatch(createQuarterCourseLoadingPlaceholder(target));
      setMoveCourseTrigger(target);
      return;
    }

    const sourceQuarter = (activeCourseDraggedFrom ?? null) as ModifiedQuarter | null;
    const addToQuarter: ModifiedQuarter = {
      startYear,
      quarter: data,
      courseIndex: event.newIndex!,
    };
    const revision = modifyQuarterCourse(currentPlan.id, activeCourse!, sourceQuarter, addToQuarter);
    dispatch(reviseRoadmap(revision));
  };

  const sortCourse = (event: SortableEvent) => {
    if (event.from !== event.to) return;
    const quarterToChange = { startYear, quarter: data, courseIndex: event.newIndex! };
    const revision = reorderQuarterCourse(currentPlan.id, activeCourse!, event.oldIndex!, quarterToChange);
    dispatch(reviseRoadmap(revision));
  };

  useEffect(() => {
    if (!moveCourseTrigger || activeCourseLoading) return; // nothing to add

    const addToQuarter: ModifiedQuarter = {
      startYear,
      quarter: data,
      courseIndex: moveCourseTrigger.courseIndex,
    };
    const revision = modifyQuarterCourse(currentPlan.id, activeCourse!, null, addToQuarter);
    dispatch(reviseRoadmap(revision));

    setMoveCourseTrigger(null);
    dispatch(setActiveCourse(null));
  }, [
    dispatch,
    moveCourseTrigger,
    activeCourseLoading,
    quarterIndex,
    yearIndex,
    startYear,
    data,
    currentPlan.id,
    activeCourse,
  ]);

  const setDraggedItem = (event: SortableEvent) => {
    const course = data.courses[event.oldIndex!];
    // set data for which quarter it's being dragged from
    dispatch(setActiveCourse({ course, startYear, quarter: data, courseIndex: event.oldIndex! }));
  };

  return (
    <Card className="quarter" ref={quarterContainerRef} variant="outlined">
      <div className="quarter-header">
        <h2 className="quarter-title">{quarterTitle.replace('10 Week', '10wk')}</h2>
        <div className="quarter-units">
          {unitCount} unit{pluralize(unitCount)}
        </div>
        {isMobile && (
          <Button
            startIcon={<PlaylistAddIcon />}
            onClick={() => dispatch(showMobileCatalog({ year: yearIndex, quarter: quarterIndex }))}
            size="small"
            variant="contained"
            color="inherit"
            disableElevation
          >
            Add Course
          </Button>
        )}
      </div>
      <ReactSortable
        list={coursesCopy}
        className={`quarter-course-list ${isDragging ? 'dropzone-active' : ''}`}
        onStart={setDraggedItem}
        onAdd={addCourse} // add course, drag from another quarter
        onSort={sortCourse} // drag within a quarter
        onEnd={() => {
          if (!activeCourseLoading) dispatch(setActiveCourse(null));
        }}
        {...quarterSortable}
      >
        {data.courses.map((course, index) => {
          let requiredCourses: string[] = null!;
          // if this is an invalid course, set the required courses
          invalidCourses.forEach((ic) => {
            const loc = ic.location;
            if (loc.courseIndex == index && loc.quarterIndex == quarterIndex && loc.yearIndex == yearIndex) {
              requiredCourses = ic.required;
            }
          });

          return (
            // addMode="drag" somehow fixes the issue with tapping a course after adding on mobile
            <Course
              key={index}
              data={course}
              requiredCourses={requiredCourses}
              onDelete={() => removeCourseAt(index)}
              addMode="drag"
              openPopoverLeft
            />
          );
        })}
      </ReactSortable>
    </Card>
  );
};

export default Quarter;
