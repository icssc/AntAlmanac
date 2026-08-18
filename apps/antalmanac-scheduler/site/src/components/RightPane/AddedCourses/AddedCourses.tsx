import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { AddedCoursesList } from '$components/RightPane/AddedCourses/AddedCoursesList';
import { CustomEventsBox } from '$components/RightPane/AddedCourses/CustomEventsBox';
import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import { ScheduleNoteBox } from '$components/RightPane/AddedCourses/ScheduleNoteBox';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import analyticsEnum from '$lib/analytics/analytics';
import {
    removeLocalStorageAddedCoursesSkeletonBlueprint,
    setLocalStorageAddedCoursesSkeletonBlueprint,
} from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleOfferingKey } from '$stores/scheduleHelpers';
import { Box, type SxProps, Typography } from '@mui/material';
import { type AACourseWithTerm, type RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

const buttonSx: SxProps = {
    backgroundColor: 'rgba(236, 236, 236, 1)',
    marginRight: 1,
    padding: 1.5,
    boxShadow: '2',
    color: 'black',
    '&:hover': {
        backgroundColor: 'grey',
    },
    pointerEvents: 'auto',
};

/**
 * Save the rendered schedule (courses + custom events) as JSON so the
 * skeleton on the next load can render the previous shape via
 * `<SectionTable skeleton>` and `<CustomEventDetailView skeleton>`.
 *
 * For courses, `courseComment` and `prerequisiteLink` are dropped (kept as
 * empty strings so the parsed shape still satisfies AACourseWithTerm). They're
 * the heaviest fields and neither is read by the visible parts of the
 * skeleton — the prereq popover never opens during loading.
 */
function persistSkeletonBlueprint(courses: AACourseWithTerm[], customEvents: RepeatingCustomEvent[]) {
    if (courses.length === 0 && customEvents.length === 0) {
        removeLocalStorageAddedCoursesSkeletonBlueprint();
        return;
    }
    const slim = {
        courses: courses.map((course) => ({
            ...course,
            courseComment: '',
            prerequisiteLink: '',
        })),
        customEvents,
    };
    setLocalStorageAddedCoursesSkeletonBlueprint(JSON.stringify(slim));
}

function persistFromAppStore() {
    persistSkeletonBlueprint(getCourses(), AppStore.schedule.getCurrentCustomEvents());
}

function getCourses() {
    const currentCourses = AppStore.schedule.getCurrentCourses();

    const formattedCourses: AACourseWithTerm[] = [];

    for (const course of currentCourses) {
        let formattedCourse = formattedCourses.find(
            (formattedCourse) => scheduleOfferingKey(formattedCourse) === scheduleOfferingKey(course)
        );

        if (formattedCourse) {
            formattedCourse.sections.push({
                ...course.section,
            });
        } else {
            formattedCourse = {
                term: course.term,
                deptCode: course.deptCode,
                courseComment: course.courseComment,
                prerequisiteLink: course.prerequisiteLink,
                courseNumber: course.courseNumber,
                courseTitle: course.courseTitle,
                courseId: course.courseId,
                sectionTypes: course.sectionTypes,
                sections: [
                    {
                        ...course.section,
                    },
                ],
                updatedAt: course.section.updatedAt ?? null,
            };
            formattedCourses.push(formattedCourse);
        }
    }

    formattedCourses.forEach(function (course) {
        course.sections.sort(function (a, b) {
            return parseInt(a.sectionCode, 10) - parseInt(b.sectionCode, 10);
        });
    });

    return formattedCourses;
}

export function AddedCourses() {
    const [courses, setCourses] = useState(getCourses);
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());
    const [scheduleIndex, setScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());

    const handleCourseOrderChange = useCallback(
        (updatedCourses: AACourseWithTerm[], _activeIndex: number, overIndex: number) => {
            setCourses(updatedCourses);

            const movedCourse = updatedCourses[overIndex];
            const nextConsecutiveCourse =
                overIndex + 1 !== updatedCourses.length ? updatedCourses[overIndex + 1] : null;

            AppStore.reorderAddedCourses(
                AppStore.getCurrentScheduleIndex(),
                scheduleOfferingKey(movedCourse),
                nextConsecutiveCourse !== null ? scheduleOfferingKey(nextConsecutiveCourse) : null
            );
        },
        []
    );

    useEffect(() => {
        // Persist whatever's already in AppStore at mount, in case it was
        // populated before this component mounted and no change event fires
        // later. Skip when both lists are empty so a stale blueprint from a
        // previous session isn't cleared before loadSchedule has a chance to
        // populate AppStore.
        if (courses.length > 0 || AppStore.schedule.getCurrentCustomEvents().length > 0) {
            persistFromAppStore();
        }

        const handleCoursesChange = () => {
            const nextCourses = getCourses();
            setCourses(nextCourses);
            persistFromAppStore();
        };

        const handleCustomEventsChange = () => {
            persistFromAppStore();
        };

        const handleScheduleNamesChange = () => {
            setScheduleNames([...AppStore.getScheduleNames()]);
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('addedCoursesChange', handleCoursesChange);
        AppStore.on('currentScheduleIndexChange', handleCoursesChange);
        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('addedCoursesChange', handleCoursesChange);
            AppStore.off('currentScheduleIndexChange', handleCoursesChange);
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, []);

    const scheduleUnits = useMemo(() => {
        let result = 0;

        for (const course of courses) {
            for (const section of course.sections) {
                if (!isNaN(Number(section.units))) {
                    result += Number(section.units);
                }
            }
        }

        return result;
    }, [courses]);

    const scheduleName = useMemo(() => {
        return scheduleNames[scheduleIndex];
    }, [scheduleNames, scheduleIndex]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', width: 'fit-content', position: 'absolute', zIndex: 2 }}>
                <CopyScheduleButton index={scheduleIndex} buttonSx={buttonSx} />
                <ClearScheduleButton buttonSx={buttonSx} analyticsCategory={analyticsEnum.addedClasses} />
                <ColumnToggleDropdown />
                <NotificationsDialog buttonSx={buttonSx} />
            </Box>
            <Box sx={{ marginTop: 7 }}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>
                {/*
                TODO (@KevinWu098) Looks too out of place. Will be added back in the calendar toolbar refactor work.
                {isMobile && <SelectSchedulePopover />} 
                */}
                <AddedCoursesList
                    courses={courses}
                    scheduleNames={scheduleNames}
                    onCourseOrderChange={handleCourseOrderChange}
                />
            </Box>

            <CustomEventsBox />

            <ScheduleNoteBox />
        </Box>
    );
}
