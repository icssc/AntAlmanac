import { Box, Chip, Paper, SxProps, TextField, Tooltip, Typography } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnToggleDropdown } from '../CoursePane/CoursePaneButtonRow';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';

import CustomEventDetailView from './CustomEventDetailView';

import { updateScheduleNote } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy } from '$lib/helpers';
import { useScheduleStore } from '$stores/ScheduleStore';

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

const NOTE_MAX_LEN = 5000;

function getCourses() {
    const currentCourses = useScheduleStore.getState().schedule.getCurrentCourses();

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

function CustomEventsBox() {
    const scheduleStore = useScheduleStore();
    const [skeletonMode, setSkeletonMode] = useState(scheduleStore.getSkeletonMode());

    const [customEvents, setCustomEvents] = useState(
        skeletonMode ? scheduleStore.getCurrentSkeletonSchedule().customEvents : scheduleStore.getCustomEvents()
    );

    useEffect(() => {
        setSkeletonMode(scheduleStore.getSkeletonMode());
    }, [scheduleStore.getSkeletonMode]);

    useEffect(() => {
        setCustomEvents([...scheduleStore.getCustomEvents()]);
    }, [scheduleStore.getCustomEvents]);

    if (customEvents.length <= 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent: any) => {
                    return (
                        <Box key={customEvent.title}>
                            <CustomEventDetailView
                                customEvent={customEvent}
                                scheduleNames={scheduleStore.getScheduleNames()}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function ScheduleNoteBox() {
    const scheduleStore = useScheduleStore();
    const [skeletonMode, setSkeletonMode] = useState(scheduleStore.getSkeletonMode());
    const [scheduleNote, setScheduleNote] = useState(
        skeletonMode ? scheduleStore.getCurrentSkeletonSchedule().scheduleNote : scheduleStore.getCurrentScheduleNote()
    );
    const [scheduleIndex, setScheduleIndex] = useState(scheduleStore.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        setSkeletonMode(scheduleStore.getSkeletonMode());
    }, [scheduleStore.getSkeletonMode]);

    useEffect(() => {
        setScheduleNote(scheduleStore.getCurrentScheduleNote());
    }, [scheduleStore.getCurrentScheduleNote]);

    useEffect(() => {
        setScheduleIndex(scheduleStore.getCurrentScheduleIndex());
    }, [scheduleStore.getCurrentScheduleIndex]);

    return (
        <Box>
            <Typography variant="h6">Schedule Notes</Typography>

            <TextField
                type="text"
                variant="filled"
                label="Click here to start typing!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{ maxLength: NOTE_MAX_LEN }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled={skeletonMode}
            />
        </Box>
    );
}

function SkeletonSchedule() {
    const skeletonSchedule = useScheduleStore((state) => state.getCurrentSkeletonSchedule());

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = skeletonSchedule.courses.reduce(
            (accumulated: any, course: any) => {
                accumulated[course.term] ??= [];
                accumulated[course.term].push(course.sectionCode);
                return accumulated;
            },
            {} as Record<string, string[]>
        );

        return Object.entries(result);
    }, [skeletonSchedule.courses]);

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">{skeletonSchedule.scheduleName}</Typography>
            {
                // Sections organized under terms, in case the schedule contains multiple terms
                sectionsByTerm.map(([term, sections]) => (
                    <Box key={term}>
                        <Typography variant="h6">{term}</Typography>
                        <Paper key={term} elevation={1}>
                            {sections.map((section, index) => (
                                <Tooltip title="Click to copy course code" placement="right" key={index}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, section);
                                            logAnalytics({
                                                category: analyticsEnum.classSearch.title,
                                                action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                                            });
                                        }}
                                        label={section}
                                        size="small"
                                        style={{ margin: '10px 10px 10px 10px' }}
                                        key={index}
                                    />
                                </Tooltip>
                            ))}
                        </Paper>
                    </Box>
                ))
            }

            <CustomEventsBox />

            <ScheduleNoteBox />

            <Typography variant="body1">
                Anteater API is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </Box>
    );
}

function AddedSectionsGrid() {
    const [courses, setCourses] = useState(getCourses());
    const scheduleNames = useScheduleStore((state) => state.getScheduleNames());
    const scheduleIndex = useScheduleStore((state) => state.getCurrentScheduleIndex());

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
        <Box display="flex" flexDirection="column" gap={1} marginX={0.5}>
            <Box display="flex" width={1} position="absolute" zIndex="2">
                <CopyScheduleButton index={scheduleIndex} buttonSx={buttonSx} />
                <ClearScheduleButton buttonSx={buttonSx} />
                <ColumnToggleDropdown />
            </Box>
            <Box style={{ marginTop: 50 }}>
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
                                    analyticsCategory={analyticsEnum.addedClasses.title}
                                    scheduleNames={scheduleNames}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <CustomEventsBox />

            <ScheduleNoteBox />
        </Box>
    );
}

export default function AddedCoursePaneFunctionComponent() {
    const skeletonMode = useScheduleStore((state) => state.getSkeletonMode());

    return <Box>{skeletonMode ? <SkeletonSchedule /> : <AddedSectionsGrid />}</Box>;
}
