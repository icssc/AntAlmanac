import { Box, SxProps, Typography } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { useEffect, useMemo, useState } from 'react';

import { CustomEventsTable } from '$components/RightPane/AddedCoursePane/CustomEventsTable';
import { ScheduleNote } from '$components/RightPane/AddedCoursePane/ScheduleNote';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import analyticsEnum from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';

/**
 * All the interactive buttons have the same styles.
 */
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

interface CourseWithTerm extends AACourse {
    term: string;
}

function getCourses() {
    const currentCourses = AppStore.schedule.getCurrentCourses();

    const formattedCourses: CourseWithTerm[] = [];

    for (const course of currentCourses) {
        let formattedCourse = formattedCourses.find(
            (needleCourse) =>
                needleCourse.courseNumber === course.courseNumber &&
                needleCourse.deptCode === course.deptCode &&
                needleCourse.courseTitle === course.courseTitle
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
                sections: [
                    {
                        ...course.section,
                    },
                ],
                updatedAt: null,
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

export function AddedSectionTable() {
    const [courses, setCourses] = useState(() => getCourses());
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());
    const [scheduleIndex, setScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());

    useEffect(() => {
        const handleCoursesChange = () => {
            setCourses(getCourses());
        };

        const handleScheduleNamesChange = () => {
            setScheduleNames([...AppStore.getScheduleNames()]);
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('addedCoursesChange', handleCoursesChange);
        AppStore.on('currentScheduleIndexChange', handleCoursesChange);
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('addedCoursesChange', handleCoursesChange);
            AppStore.off('currentScheduleIndexChange', handleCoursesChange);
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

    // "No Courses Added Yet!" notification
    const NoCoursesBox = (
        <Box style={{ paddingTop: '12px', paddingBottom: '12px' }}>
            <Typography align="left">No Courses Added Yet!</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', width: 'fit-content', position: 'absolute', zIndex: 2 }}>
                <CopyScheduleButton index={scheduleIndex} buttonSx={buttonSx} />
                <ClearScheduleButton sx={buttonSx} analyticsCategory={analyticsEnum.addedClasses} />
                <ColumnToggleDropdown />
            </Box>
            <Box sx={{ marginTop: 7 }}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>
                {courses.length < 1 ? NoCoursesBox : null}
                <Box display="flex" flexDirection="column" gap={1}>
                    {courses.map((course) => {
                        return (
                            <Box key={course.deptCode + course.courseNumber + course.courseTitle}>
                                <SectionTableLazyWrapper
                                    courseDetails={course}
                                    term={course.term}
                                    allowHighlight={false}
                                    analyticsCategory={analyticsEnum.addedClasses}
                                    scheduleNames={scheduleNames}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <CustomEventsTable />

            <ScheduleNote />
        </Box>
    );
}
