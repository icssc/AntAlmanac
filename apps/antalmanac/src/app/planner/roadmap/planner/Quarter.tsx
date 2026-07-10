'use client';
import { isCustomCourse } from '$planner/helpers/customCourses';
import { calculateTotalUnits, quarterDisplayNames } from '$planner/helpers/planner';
import {
    type ModifiedQuarter,
    modifyQuarterCourse,
    modifyVariableCourseUnit,
    reorderQuarterCourse,
} from '$planner/helpers/roadmapEdits';
import { quarterSortable } from '$planner/helpers/sortable';
import { deepCopy, pluralize, useIsMobile } from '$planner/helpers/util';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { useAnimatedHeight } from '$planner/hooks/useAnimatedHeight';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import {
    createQuarterCourseLoadingPlaceholder,
    reviseRoadmap,
    selectCurrentPlan,
    setActiveCourse,
    setActiveCustomCourse,
    showMobileCatalog,
} from '$planner/store/slices/roadmapSlice';

import './Quarter.scss';
import { type CourseIdentifier, type PlannerQuarterData } from '$planner/types/types';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Button, Card } from '@mui/material';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { ReactSortable, type SortableEvent } from 'react-sortablejs';

import CustomCourseCard from '../catalog/CustomCourseCard';
import Course from './Course';

interface QuarterProps {
    yearIndex: number;
    quarterIndex: number;
    data: PlannerQuarterData;
}

const Quarter: FC<QuarterProps> = ({ yearIndex, quarterIndex, data }) => {
    const dispatch = useAppDispatch();
    const quarterTitle = quarterDisplayNames[data.name];
    const invalidCourses = useAppSelector(
        (state) => state.roadmap.plans[state.roadmap.currentPlanIndex].content.invalidCourses
    );
    const quarterContainerRef = useRef<HTMLDivElement>(null);
    useAnimatedHeight(quarterContainerRef);
    const isMobile = useIsMobile();
    const [moveCourseTrigger, setMoveCourseTrigger] = useState<CourseIdentifier | null>(null);
    const activeCourseLoading = useAppSelector((state) => state.roadmap.activeCourseLoading);
    const activeCourse = useAppSelector((state) => state.roadmap.activeCourse);
    const activeCustomCourse = useAppSelector((state) => state.roadmap.activeCustomCourse);
    const activeCourseDraggedFrom = useAppSelector((state) => state.roadmap.activeCourseDragSource);
    const isLoggedIn = useIsLoggedIn();
    const isDragging = activeCourse !== null || activeCustomCourse !== null;
    const currentPlan = useAppSelector(selectCurrentPlan);
    const startYear = currentPlan.content.yearPlans[yearIndex].startYear;
    const courses = data.courses;

    // Calculate Quarter Stats
    const unitCount = useMemo(() => {
        const courses = data.courses;
        const { unitCount } = calculateTotalUnits(courses);

        return unitCount;
    }, [data]);

    const coursesCopy = deepCopy(data.courses); // Sortable requires data to be extensible (non read-only)

    const removeCourseAt = useCallback(
        (index: number) => {
            const quarterToRemove = { startYear, quarter: data, courseIndex: index };
            const revision = modifyQuarterCourse(currentPlan.id, data.courses[index], quarterToRemove, null);
            dispatch(reviseRoadmap(revision));
        },
        [currentPlan.id, data, dispatch, startYear]
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
        if (activeCustomCourse) {
            if (!isLoggedIn) return;
            const revision = modifyQuarterCourse(currentPlan.id, activeCustomCourse, sourceQuarter, addToQuarter);
            dispatch(reviseRoadmap(revision));
            return;
        }
        if (!activeCourse) return;
        const revision = modifyQuarterCourse(currentPlan.id, activeCourse!, sourceQuarter, addToQuarter);
        dispatch(reviseRoadmap(revision));
    };

    const sortCourse = (event: SortableEvent) => {
        if (event.from !== event.to) return;
        const courseToReorder = activeCustomCourse ?? activeCourse;
        if (!courseToReorder) return;
        const quarterToChange = { startYear, quarter: data, courseIndex: event.newIndex! };
        const revision = reorderQuarterCourse(currentPlan.id, courseToReorder, event.oldIndex!, quarterToChange);
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
        if (isCustomCourse(course)) {
            dispatch(setActiveCustomCourse({ course, startYear, quarter: data, courseIndex: event.oldIndex! }));
        } else {
            dispatch(setActiveCourse({ course, startYear, quarter: data, courseIndex: event.oldIndex! }));
        }
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
                    if (!activeCourseLoading) {
                        dispatch(setActiveCourse(null));
                        dispatch(setActiveCustomCourse(null));
                    }
                }}
                {...quarterSortable}
            >
                {courses.map((course, index) => {
                    if ('courseName' in course) {
                        if (!isLoggedIn) {
                            return (
                                <div key={`custom-${course.id}-${index}`} className="quarter-custom-course-logged-out">
                                    <p>Log in to use custom cards!</p>
                                </div>
                            );
                        }
                        return (
                            <CustomCourseCard
                                key={`custom-${course.id}-${index}`}
                                course={course}
                                handleUpdate={() => {}}
                                inRoadmap={true}
                                removeCourseAt={() => removeCourseAt(index)}
                            />
                        );
                    }

                    let requiredCourses: string[] = null!;
                    // if this is an invalid course, set the required courses
                    invalidCourses.forEach((ic) => {
                        const loc = ic.location;
                        if (
                            loc.courseIndex == index &&
                            loc.quarterIndex == quarterIndex &&
                            loc.yearIndex == yearIndex
                        ) {
                            requiredCourses = ic.required;
                        }
                    });

                    const searchPrevYears = 2;
                    const currentDate = new Date();
                    const currentStartYear =
                        currentDate.getMonth() >= 8 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
                    const useYear = Math.min(currentStartYear, startYear);
                    const termYear = data.name === 'Fall' ? useYear : useYear + 1;
                    let mismatch = true;
                    for (let i = 0; i <= searchPrevYears; i++) {
                        const term = `${termYear - i} ${data.name}`;
                        if (course.terms.includes(term)) {
                            mismatch = false;
                            break;
                        }
                    }
                    const notRecentlyOffered =
                        mismatch &&
                        !course.terms.some((term) => {
                            for (let i = 0; i <= searchPrevYears; i++) {
                                if (term.startsWith(`${termYear - i} `)) return true;
                            }
                            return false;
                        });
                    const termMismatch = mismatch ? (notRecentlyOffered ? 'RecentYears' : data.name) : undefined;

                    return (
                        // addMode="drag" somehow fixes the issue with tapping a course after adding on mobile
                        <Course
                            key={index}
                            data={course}
                            onSetVariableUnits={(units) => {
                                const revision = modifyVariableCourseUnit(
                                    currentPlan.id,
                                    startYear,
                                    data.name,
                                    index,
                                    course,
                                    units
                                );
                                if (revision.edits.length > 0) dispatch(reviseRoadmap(revision));
                            }}
                            requiredCourses={requiredCourses}
                            termMismatch={termMismatch}
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
