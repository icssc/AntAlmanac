import { useCallback, useEffect, useMemo, useState, Fragment } from 'react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

import { withStyles } from '@material-ui/core/styles';
import type { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Button, Grid, Menu, MenuItem, Paper, TextField, Typography } from '@material-ui/core';
import { AACourse } from '@packages/antalmanac-types';

import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import CustomEventDetailView from './CustomEventDetailView';
import AppStore from '$stores/AppStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clearSchedules, copySchedule, updateScheduleNote } from '$actions/AppStoreActions';


interface CourseWithTerm extends AACourse {
    term: string;
}

const NOTE_MAX_LEN = 5000;

const styles = {
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    },
    clearSchedule: {
        marginLeft: '4px',
        marginRight: '4px',
    },
    scheduleNoteContainer: {
        padding: '8px',
        marginLeft: '4px',
        marginRight: '4px',
        width: '100%',
    },
};

function getCourses() {
    const currentCourses = AppStore.schedules.getCurrentCourses();

    const formattedCourses: CourseWithTerm[] = [];

    for (const course of currentCourses) {
        let formattedCourse = formattedCourses.find(
            (needleCourse) =>
                needleCourse.courseNumber === course.courseNumber && needleCourse.deptCode === course.deptCode
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

function SkeletonSchedule() {
    const [skeletonSchedule, setSkeletonSchedule] = useState(AppStore.getSkeletonSchedule());

    const updateSkeletonSchedule = useCallback(() => {
        setSkeletonSchedule(AppStore.getSkeletonSchedule());
    }, [setSkeletonSchedule]);

    useEffect(() => {
        AppStore.on('skeletonScheduleChange', updateSkeletonSchedule);
        return () => {
            AppStore.removeListener('skeletonScheduleChange', updateSkeletonSchedule);
        };
    }, []);

    const sectionsByTerm = useMemo(() => {
        const result = skeletonSchedule.courses.reduce((accumulated, course) => {
            accumulated[course.term] ??= [];
            accumulated[course.term].push(course.sectionCode);
            return accumulated;
        }, {} as Record<string, string[]>);

        return Object.entries(result);
    }, [skeletonSchedule.courses]);

    return (
        <>
            {
                // Sections organized under terms, in case the schedule contains multiple terms
                sectionsByTerm.map(([term, sections], index) => {
                    return (
                        <Fragment key={index}>
                            <Typography variant="h6">{term}</Typography>
                            <Paper key={term} elevation={1}>
                                <Grid item md={12} xs={12} key={term} style={{ padding: '15px 0px 15px' }}>
                                    <Typography variant="body1">Sections enrolled: {sections.join(', ')}</Typography>
                                </Grid>
                            </Paper>
                        </Fragment>
                    );
                })
            }
            <Typography variant="body1">
                PeterPortal or WebSoc is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </>
    );
}

const AddedSectionsGrid = withStyles(styles)((props: { classes: ClassNameMap }) => {
    const [courses, setCourses] = useState(getCourses());
    const [customEvents, setCustomEvents] = useState(AppStore.schedules.getCurrentCustomEvents());
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [scheduleNote, setScheduleNote] = useState(AppStore.getCurrentScheduleNote());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

    const handleCoursesChange = useCallback(() => {
        setCourses(getCourses());
    }, [setCourses]);

    const handleCustomEventsChange = useCallback(() => {
        setCustomEvents(AppStore.schedules.getCurrentCustomEvents());
    }, [setCustomEvents]);

    const handleScheduleNamesChange = useCallback(() => {
        setScheduleNames(AppStore.getScheduleNames());
    }, [setScheduleNames]);

    const handleScheduleNoteChange = useCallback(() => {
        setScheduleNote(AppStore.getCurrentScheduleNote());
    }, []);

    const handleScheduleIndexChange = useCallback(() => {
        setScheduleIndex(AppStore.getCurrentScheduleIndex());
    }, [setScheduleIndex]);

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [setScheduleNote, scheduleIndex]
    );

    useEffect(() => {
        AppStore.on('addedCoursesChange', handleCoursesChange);
        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCoursesChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        AppStore.on('scheduleNotesChange', handleScheduleNoteChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.removeListener('addedCoursesChange', handleCoursesChange);
            AppStore.removeListener('customEventsChange', handleCustomEventsChange);
            AppStore.removeListener('currentScheduleIndexChange', handleCoursesChange);
            AppStore.removeListener('currentScheduleIndexChange', handleCustomEventsChange);
            AppStore.removeListener('scheduleNamesChange', handleScheduleNamesChange);
            AppStore.removeListener('scheduleNotesChange', handleScheduleNoteChange);
            AppStore.removeListener('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, [handleCoursesChange, handleCustomEventsChange, handleScheduleNamesChange, handleScheduleNoteChange]);

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
    }, [scheduleIndex, scheduleNames]);

    return (
        <Grid container spacing={2}>
            <div className={props.classes.titleRow}>
                <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>

                <div>
                    <PopupState variant="popover">
                        {(popupState) => (
                            <>
                                <Button variant="outlined" {...bindTrigger(popupState)}>
                                    Copy Schedule
                                </Button>
                                <Menu {...bindMenu(popupState)}>
                                    {scheduleNames.map((name, index) => {
                                        return (
                                            <MenuItem
                                                key={index}
                                                disabled={AppStore.getCurrentScheduleIndex() === index}
                                                onClick={() => {
                                                    copySchedule(index);
                                                    popupState.close();
                                                }}
                                            >
                                                Copy to {name}
                                            </MenuItem>
                                        );
                                    })}
                                    <MenuItem
                                        onClick={() => {
                                            copySchedule(scheduleNames.length);
                                            popupState.close();
                                        }}
                                    >
                                        Copy to All Schedules
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </PopupState>

                    <Button
                        className={props.classes.clearSchedule}
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to clear this schedule? You cannot undo this action, but you can load your schedule again.'
                                )
                            ) {
                                clearSchedules();
                                logAnalytics({
                                    category: analyticsEnum.addedClasses.title,
                                    action: analyticsEnum.addedClasses.actions.CLEAR_SCHEDULE,
                                });
                            }
                        }}
                    >
                        Clear Schedule
                    </Button>
                </div>
            </div>

            {courses.map((course) => {
                return (
                    <Grid item md={12} xs={12} key={course.deptCode + course.courseNumber}>
                        <SectionTableLazyWrapper
                            classes={props.classes}
                            courseDetails={course}
                            term={course.term}
                            colorAndDelete={true}
                            highlightAdded={false}
                            analyticsCategory={analyticsEnum.addedClasses.title}
                            scheduleNames={scheduleNames}
                        />
                    </Grid>
                );
            })}

            {customEvents.length > 0 && <Typography variant="h6">Custom Events</Typography>}

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

            <Typography variant="h6">Schedule Notes</Typography>

            <Paper className={props.classes.scheduleNoteContainer}>
                <TextField
                    type="text"
                    placeholder="This schedule does not have any notes! Click here to start typing!"
                    onChange={handleNoteChange}
                    value={scheduleNote}
                    inputProps={{ maxLength: NOTE_MAX_LEN }}
                    InputProps={{ disableUnderline: true }}
                    fullWidth
                    multiline
                />
            </Paper>
        </Grid>
    );
});

export default function AddedCoursePaneFunctionComponent() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const handleSkeletonModeChange = useCallback(() => {
        setSkeletonMode(AppStore.getSkeletonMode());
    }, [setSkeletonMode]);

    useEffect(() => {
        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.removeListener('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [handleSkeletonModeChange]);

    return skeletonMode ? <SkeletonSchedule /> : <AddedSectionsGrid />;
}
