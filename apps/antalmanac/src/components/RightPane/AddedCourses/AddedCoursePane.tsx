import { Box, Chip, Paper, SxProps, TextField, Tooltip, Typography } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { updateScheduleNote } from '$actions/AppStoreActions';
import CustomEventDetailView from '$components/RightPane/AddedCourses/CustomEventDetailView';
import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import { getMissingSections } from '$components/RightPane/AddedCourses/getMissingSections';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { useIsReadonlyView } from '$hooks/useIsReadonlyView';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
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

export interface CourseWithTerm extends AACourse {
    term: string;
}

const NOTE_MAX_LEN = 5000;

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
                sectionTypes: course.sectionTypes,
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
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const getCustomEvents = useCallback(() => {
        if (skeletonMode) {
            const skeletonSchedule = AppStore.getCurrentSkeletonSchedule();
            if (!skeletonSchedule.customEvents || skeletonSchedule.customEvents.length === 0) {
                return AppStore.schedule.getCurrentCustomEvents();
            }
            return skeletonSchedule.customEvents;
        }
        return AppStore.schedule.getCurrentCustomEvents();
    }, [skeletonMode]);

    const [customEvents, setCustomEvents] = useState(getCustomEvents);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
            setCustomEvents(getCustomEvents());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [getCustomEvents]);

    useEffect(() => {
        const handleCustomEventsChange = () => {
            setCustomEvents(getCustomEvents());
        };

        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);

        return () => {
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('currentScheduleIndexChange', handleCustomEventsChange);
        };
    }, [getCustomEvents]);

    if (customEvents.length <= 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent) => {
                    return (
                        <Box key={customEvent.customEventID}>
                            <CustomEventDetailView
                                customEvent={customEvent}
                                scheduleNames={AppStore.getScheduleNames()}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function ScheduleNoteBox() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const getScheduleNote = useCallback(() => {
        if (skeletonMode) {
            const skeletonSchedule = AppStore.getCurrentSkeletonSchedule();
            if (!skeletonSchedule.scheduleNote) {
                return AppStore.getCurrentScheduleNote();
            }
            return skeletonSchedule.scheduleNote;
        }
        return AppStore.getCurrentScheduleNote();
    }, [skeletonMode]);

    const [scheduleNote, setScheduleNote] = useState(getScheduleNote);
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
            setScheduleNote(getScheduleNote());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [getScheduleNote]);

    useEffect(() => {
        const handleScheduleNoteChange = () => {
            setScheduleNote(getScheduleNote());
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
            setScheduleNote(getScheduleNote());
        };

        AppStore.on('scheduleNotesChange', handleScheduleNoteChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('scheduleNotesChange', handleScheduleNoteChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, [getScheduleNote]);

    return (
        <Box>
            <Typography variant="h6">Schedule Notes</Typography>

            <TextField
                type="text"
                variant="filled"
                label="Click here to start typing!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{
                    maxLength: NOTE_MAX_LEN,
                    style: { cursor: skeletonMode ? 'not-allowed' : 'text' },
                }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled={skeletonMode}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: skeletonMode ? 'not-allowed' : 'text',
                    },
                }}
            />
        </Box>
    );
}

function SkeletonSchedule() {
    const getScheduleData = () => {
        const skeletonSchedule = AppStore.getCurrentSkeletonSchedule();
        if (!skeletonSchedule.courses || skeletonSchedule.courses.length === 0) {
            const regularCourses = AppStore.schedule.getCurrentCourses();
            if (regularCourses.length > 0) {
                return {
                    scheduleName: AppStore.schedule.getScheduleName(AppStore.getCurrentScheduleIndex()) || '',
                    courses: regularCourses.map((course) => ({
                        sectionCode: course.section.sectionCode,
                        term: course.term,
                        color: course.section.color,
                    })),
                    customEvents: AppStore.schedule.getCurrentCustomEvents(),
                    scheduleNote: AppStore.getCurrentScheduleNote(),
                };
            }
        }
        return skeletonSchedule;
    };

    const [skeletonSchedule, setSkeletonSchedule] = useState(getScheduleData);
    const postHog = usePostHog();

    useEffect(() => {
        const updateSkeletonSchedule = () => {
            setSkeletonSchedule(getScheduleData());
        };

        AppStore.on('skeletonScheduleChange', updateSkeletonSchedule);
        AppStore.on('currentScheduleIndexChange', updateSkeletonSchedule);
        AppStore.on('addedCoursesChange', updateSkeletonSchedule);
        AppStore.on('customEventsChange', updateSkeletonSchedule);

        return () => {
            AppStore.off('skeletonScheduleChange', updateSkeletonSchedule);
            AppStore.off('currentScheduleIndexChange', updateSkeletonSchedule);
            AppStore.off('addedCoursesChange', updateSkeletonSchedule);
            AppStore.off('customEventsChange', updateSkeletonSchedule);
        };
    }, []);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const courses = skeletonSchedule?.courses || [];
        const result = courses.reduce(
            (accumulated, course) => {
                accumulated[course.term] ??= [];
                accumulated[course.term].push(course.sectionCode);
                return accumulated;
            },
            {} as Record<string, string[]>
        );

        return Object.entries(result);
    }, [skeletonSchedule?.courses]);

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
                                <Tooltip title="Click to copy section code" placement="right" key={index}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, section);
                                            logAnalytics(postHog, {
                                                category: analyticsEnum.addedClasses,
                                                action: analyticsEnum.addedClasses.actions.COPY_COURSE_CODE,
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
    const isReadonlyView = useIsReadonlyView();
    const [courses, setCourses] = useState(getCourses());
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

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
                {!isReadonlyView && (
                    <>
                        <CopyScheduleButton index={scheduleIndex} buttonSx={buttonSx} />
                        <ClearScheduleButton buttonSx={buttonSx} analyticsCategory={analyticsEnum.addedClasses} />
                    </>
                )}
                <ColumnToggleDropdown />
                <NotificationsDialog buttonSx={buttonSx} />
            </Box>
            <Box sx={{ marginTop: 7 }}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>
                {courses.length < 1 ? NoCoursesBox : null}
                <Box display="flex" flexDirection="column" gap={1}>
                    {courses.map((course) => {
                        const missingSections = getMissingSections(course);

                        return (
                            <Box key={course.deptCode + course.courseNumber + course.courseTitle}>
                                <SectionTableLazyWrapper
                                    courseDetails={course}
                                    term={course.term}
                                    allowHighlight={false}
                                    analyticsCategory={analyticsEnum.addedClasses}
                                    scheduleNames={scheduleNames}
                                    missingSections={missingSections}
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

export function AddedCoursePane() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const postHog = usePostHog();

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [postHog]);

    const hasRegularCourses = AppStore.schedule.getCurrentCourses().length > 0;
    const skeletonSchedule = AppStore.getCurrentSkeletonSchedule();
    const hasSkeletonCourses = skeletonSchedule.courses && skeletonSchedule.courses.length > 0;

    const shouldShowAddedSectionsGrid = !skeletonMode || (skeletonMode && hasRegularCourses && !hasSkeletonCourses);

    return <Box>{shouldShowAddedSectionsGrid ? <AddedSectionsGrid /> : <SkeletonSchedule />}</Box>;
}
