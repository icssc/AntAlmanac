import { useCallback, useEffect, useMemo, useState } from 'react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import {
    Box,
    Chip,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    SxProps,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { ContentCopy, DeleteOutline } from '@mui/icons-material';
import { AACourse } from '@packages/antalmanac-types';

import { ColumnToggleButton } from '../CoursePane/CoursePaneButtonRow';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import CustomEventDetailView from './CustomEventDetailView';
import AppStore from '$stores/AppStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clearSchedules, copySchedule, updateScheduleNote } from '$actions/AppStoreActions';
import { clickToCopy } from '$lib/helpers';

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

function handleClear() {
    if (window.confirm('Are you sure you want to clear this schedule?')) {
        clearSchedules();
        logAnalytics({
            category: analyticsEnum.addedClasses.title,
            action: analyticsEnum.addedClasses.actions.CLEAR_SCHEDULE,
        });
    }
}

function createCopyHandler(index: number) {
    return () => {
        copySchedule(index);
    };
}

function ClearScheduleButton() {
    return (
        <Tooltip title="Clear Schedule">
            <IconButton sx={buttonSx} onClick={handleClear}>
                <DeleteOutline />
            </IconButton>
        </Tooltip>
    );
}

function CopyScheduleButton() {
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    useEffect(() => {
        /**
         * A shallow copy needs to be made so the array reference is different and the component re-renders.
         */
        const handleScheduleNamesChange = () => {
            setScheduleNames([...AppStore.getScheduleNames()]);
        };

        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, []);

    return (
        <PopupState variant="popover">
            {(popupState) => (
                <>
                    <Tooltip title="Copy Schedule">
                        <IconButton {...bindTrigger(popupState)} sx={buttonSx} size="medium">
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                    <Menu {...bindMenu(popupState)}>
                        {scheduleNames.map((name, index) => (
                            <MenuItem
                                key={index}
                                disabled={AppStore.getCurrentScheduleIndex() === index}
                                onClick={createCopyHandler(index)}
                            >
                                Copy to {name}
                            </MenuItem>
                        ))}
                        <MenuItem onClick={createCopyHandler(scheduleNames.length)}>Copy to All Schedules</MenuItem>
                    </Menu>
                </>
            )}
        </PopupState>
    );
}

function SkeletonSchedule() {
    const [skeletonSchedule, setSkeletonSchedule] = useState(AppStore.getSkeletonSchedule());

    useEffect(() => {
        const updateSkeletonSchedule = () => {
            setSkeletonSchedule(AppStore.getSkeletonSchedule());
        };

        AppStore.on('skeletonScheduleChange', updateSkeletonSchedule);

        return () => {
            AppStore.off('skeletonScheduleChange', updateSkeletonSchedule);
        };
    }, []);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = skeletonSchedule.courses.reduce((accumulated, course) => {
            accumulated[course.term] ??= [];
            accumulated[course.term].push(course.sectionCode);
            return accumulated;
        }, {} as Record<string, string[]>);

        return Object.entries(result);
    }, [skeletonSchedule.courses]);

    return (
        <Box>
            <Typography>{skeletonSchedule.scheduleName}</Typography>
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
            <Typography variant="body1">
                PeterPortal or WebSoc is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </Box>
    );
}

function AddedSectionsGrid() {
    const [courses, setCourses] = useState(getCourses());
    const [customEvents, setCustomEvents] = useState(AppStore.schedule.getCurrentCustomEvents());
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [scheduleNote, setScheduleNote] = useState(AppStore.getCurrentScheduleNote());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        const handleCoursesChange = () => {
            setCourses(getCourses());
        };

        const handleCustomEventsChange = () => {
            setCustomEvents([...AppStore.schedule.getCurrentCustomEvents()]);
        };

        const handleScheduleNamesChange = () => {
            setScheduleNames([...AppStore.getScheduleNames()]);
        };

        const handleScheduleNoteChange = () => {
            setScheduleNote(AppStore.getCurrentScheduleNote());
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('addedCoursesChange', handleCoursesChange);
        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCoursesChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        AppStore.on('scheduleNotesChange', handleScheduleNoteChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('addedCoursesChange', handleCoursesChange);
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('currentScheduleIndexChange', handleCoursesChange);
            AppStore.off('currentScheduleIndexChange', handleCustomEventsChange);
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
            AppStore.off('scheduleNotesChange', handleScheduleNoteChange);
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
        <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" width={1} position="absolute" zIndex="2">
                <CopyScheduleButton />
                <ClearScheduleButton />
                <ColumnToggleButton />
            </Box>
            <Box style={{ marginTop: 50 }}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>
                <Grid container spacing={2} padding={0}>
                    {courses.map((course) => {
                        return (
                            <Grid item md={12} xs={12} key={course.deptCode + course.courseNumber + course.courseTitle}>
                                <SectionTableLazyWrapper
                                    courseDetails={course}
                                    term={course.term}
                                    allowHighlight={false}
                                    analyticsCategory={analyticsEnum.addedClasses.title}
                                    scheduleNames={scheduleNames}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {customEvents.length > 0 && (
                <Box>
                    <Typography variant="h6">Custom Events</Typography>
                    <Grid container spacing={2} padding={0}>
                        {customEvents.map((customEvent) => {
                            return (
                                <Grid item md={12} xs={12} key={customEvent.title}>
                                    <CustomEventDetailView
                                        customEvent={customEvent}
                                        currentScheduleIndex={AppStore.getCurrentScheduleIndex()}
                                        scheduleNames={scheduleNames}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

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
                />
            </Box>
        </Box>
    );
}

export default function AddedCoursePaneFunctionComponent() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return <Box padding={1}>{skeletonMode ? <SkeletonSchedule /> : <AddedSectionsGrid />}</Box>;
}
