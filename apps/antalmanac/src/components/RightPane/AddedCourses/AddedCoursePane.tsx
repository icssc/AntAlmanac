import { Box, Chip, Paper, SxProps, TextField, Tooltip, Typography } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnToggleDropdown } from '../CoursePane/CoursePaneButtonRow';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';

import CustomEventDetailView from './CustomEventDetailView';

import { updateScheduleNote } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import { WebSOC } from '$lib/websoc';
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

const NOTE_MAX_LEN = 5000;

//Checks added courses for missing sections
const checkCompleteSections = async (userCourses: CourseWithTerm): Promise<string[]> => {
    try {
        const websocParams = {
            department: userCourses.deptCode,
            courseNumber: userCourses.courseNumber,
            term: userCourses.term,
        };

        const fullCourseData = await WebSOC.query(websocParams);

        const sections = fullCourseData?.schools?.[0]?.departments?.[0]?.courses?.[0]?.sections;

        //Return an empty array if the API behaves unexpectedly. No warning will be shown in the UI in this case
        if (!sections || !Array.isArray(sections)) {
            console.log('Cannot show section warnings. WebSOC response unexpected: ', fullCourseData);
            return [];
        }

        //Get all of the unique section types
        const requiredTypes = new Set(sections.map((section) => section.sectionType.trim().toLowerCase()));
        const userTypes = new Set(userCourses.sections.map((section) => section.sectionType.trim().toLowerCase()));

        const missingTypes = [...requiredTypes].filter((type) => !userTypes.has(type));
        return missingTypes;
    } catch (error) {
        console.error('Error fetching course data from WebSOC:', error);
        return [];
    }
};

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

function CustomEventsBox() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [customEvents, setCustomEvents] = useState(
        skeletonMode ? AppStore.getCurrentSkeletonSchedule().customEvents : AppStore.schedule.getCurrentCustomEvents()
    );

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    useEffect(() => {
        const handleCustomEventsChange = () => {
            setCustomEvents([...AppStore.schedule.getCurrentCustomEvents()]);
        };

        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);

        return () => {
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('currentScheduleIndexChange', handleCustomEventsChange);
        };
    }, []);

    if (customEvents.length <= 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent) => {
                    return (
                        <Box key={customEvent.title}>
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
    const [scheduleNote, setScheduleNote] = useState(
        skeletonMode ? AppStore.getCurrentSkeletonSchedule().scheduleNote : AppStore.getCurrentScheduleNote()
    );
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
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    useEffect(() => {
        const handleScheduleNoteChange = () => {
            setScheduleNote(AppStore.getCurrentScheduleNote());
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('scheduleNotesChange', handleScheduleNoteChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('scheduleNotesChange', handleScheduleNoteChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, []);

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
    const [skeletonSchedule, setSkeletonSchedule] = useState(AppStore.getCurrentSkeletonSchedule());
    const postHog = usePostHog();

    useEffect(() => {
        const updateSkeletonSchedule = () => {
            setSkeletonSchedule(AppStore.getCurrentSkeletonSchedule());
        };

        AppStore.on('skeletonScheduleChange', updateSkeletonSchedule);
        AppStore.on('currentScheduleIndexChange', updateSkeletonSchedule);

        return () => {
            AppStore.off('skeletonScheduleChange', updateSkeletonSchedule);
            AppStore.off('currentScheduleIndexChange', updateSkeletonSchedule);
        };
    }, []);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = skeletonSchedule.courses.reduce(
            (accumulated, course) => {
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
    const [courses, setCourses] = useState(getCourses());
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [missingTypes, setMissingTypes] = useState<Record<string, string[]>>({});

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

    //Check for any missing sections for each added course
    useEffect(() => {
        const checkCourses = async () => {
            const missing: Record<string, string[]> = {};

            //Check the sections in every course the user has scheduled
            for (const course of courses) {
                const courseKey = `${course.deptCode}${course.courseNumber}`;
                const missingSections = await checkCompleteSections(course);
                missing[courseKey] = missingSections;
            }

            setMissingTypes(missing);
        };
        if (courses.length > 0) {
            checkCourses();
        }
    }, [courses]);

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
                <ClearScheduleButton buttonSx={buttonSx} analyticsCategory={analyticsEnum.addedClasses} />
                <ColumnToggleDropdown />
            </Box>
            <Box sx={{ marginTop: 7 }}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>
                {courses.length < 1 ? NoCoursesBox : null}
                <Box display="flex" flexDirection="column" gap={1}>
                    {courses.map((course) => {
                        const courseKey = `${course.deptCode}${course.courseNumber}`;
                        const missing = missingTypes[courseKey] || [];
                        const missingLabels = [];

                        for (const section of missing) {
                            if (section === 'dis') {
                                missingLabels.push('Discussion');
                            } else if (section === 'lab') {
                                missingLabels.push('Lab');
                            } else if (section === 'lec') {
                                missingLabels.push('Lecture');
                            } else if (section === 'sem') {
                                missingLabels.push('Seminar');
                            } else if (section === 'res') {
                                missingLabels.push('Research');
                            } else if (section == 'qiz') {
                                missingLabels.push('Quiz');
                            } else if (section == 'tap') {
                                missingLabels.push('Tutorial Assistance Program');
                            } else if (section == 'col') {
                                missingLabels.push('Colloquium');
                            } else if (section == 'act') {
                                missingLabels.push('Activity');
                            } else if (section == 'stu') {
                                missingLabels.push('Studio');
                            } else if (section == 'tut') {
                                missingLabels.push('Tutorial');
                            }
                        }

                        return (
                            <Box key={course.deptCode + course.courseNumber + course.courseTitle}>
                                <SectionTableLazyWrapper
                                    courseDetails={course}
                                    term={course.term}
                                    allowHighlight={false}
                                    analyticsCategory={analyticsEnum.addedClasses}
                                    scheduleNames={scheduleNames}
                                    missingSections={missingLabels}
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

        console.log('Opened added course');

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return <Box>{skeletonMode ? <SkeletonSchedule /> : <AddedSectionsGrid />}</Box>;
}
