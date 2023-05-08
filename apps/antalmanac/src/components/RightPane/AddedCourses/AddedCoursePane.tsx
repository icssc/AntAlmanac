import { Button, Grid, Menu, MenuItem, Paper, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { PureComponent } from 'react';

import { RepeatingCustomEvent } from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import CustomEventDetailView from './CustomEventDetailView';
import { clearSchedules, copySchedule, updateScheduleNote } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { AACourse } from '$lib/peterportal.types';
import AppStore from '$stores/AppStore';

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

interface CourseWithTerm extends AACourse {
    term: string;
}

interface AddedCoursePaneProps {
    classes: ClassNameMap;
}

interface AddedCoursePaneState {
    courses: CourseWithTerm[];
    customEvents: RepeatingCustomEvent[];
    scheduleNames: string[];
    scheduleNote: string;
    barebonesMode: boolean;
}

class AddedCoursePane extends PureComponent<AddedCoursePaneProps, AddedCoursePaneState> {
    state: AddedCoursePaneState = {
        courses: [],
        customEvents: [],
        scheduleNames: AppStore.getScheduleNames(),
        scheduleNote: AppStore.getCurrentScheduleNote(),
        barebonesMode: AppStore.getBarebonesMode(),
    };

    componentDidMount = () => {
        this.loadCourses();
        this.loadCustomEvents();
        AppStore.on('addedCoursesChange', this.loadCourses);
        AppStore.on('customEventsChange', this.loadCustomEvents);
        AppStore.on('currentScheduleIndexChange', this.loadCourses);
        AppStore.on('currentScheduleIndexChange', this.loadCustomEvents);
        AppStore.on('scheduleNamesChange', this.loadScheduleNames);
        AppStore.on('scheduleNotesChange', this.loadScheduleNote);
        AppStore.on('barebonesModeChange', this.barebonesModeChange);

        logAnalytics({
            category: analyticsEnum.addedClasses.title,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });
    };

    componentWillUnmount() {
        AppStore.removeListener('addedCoursesChange', this.loadCourses);
        AppStore.removeListener('customEventsChange', this.loadCustomEvents);
        AppStore.removeListener('currentScheduleIndexChange', this.loadCourses);
        AppStore.removeListener('currentScheduleIndexChange', this.loadCustomEvents);
        AppStore.removeListener('scheduleNamesChange', this.loadScheduleNames);
        AppStore.removeListener('scheduleNotesChange', this.loadScheduleNote);
        AppStore.removeListener('barebonesModeChange', this.barebonesModeChange);
    }

    loadCourses = () => {
        const currentCourses = AppStore.schedules.getCurrentCourses();
        let totalUnits = 0;
        const formattedCourses: CourseWithTerm[] = [];

        for (const course of currentCourses) {
            let formattedCourse: CourseWithTerm | undefined = formattedCourses.find(
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
                return parseInt(a.sectionCode) - parseInt(b.sectionCode);
            });
        });
        this.setState({ courses: formattedCourses });
    };

    loadCustomEvents = () => {
        this.setState({ customEvents: AppStore.schedules.getCurrentCustomEvents() });
        // Force update required because the state has a reference to custom events, so it doesn't see differences all the time
        this.forceUpdate();
    };

    loadScheduleNames = () => {
        this.setState({ scheduleNames: AppStore.getScheduleNames() });
    };

    loadScheduleNote = () => {
        this.setState({ scheduleNote: AppStore.getCurrentScheduleNote() });
    };

    handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ scheduleNote: event.target.value });
        updateScheduleNote(event.target.value, AppStore.getCurrentScheduleIndex());
    };

    getTotalUnits = () => {
        let totalUnits = 0;

        for (const course of this.state.courses) {
            for (const section of course.sections) {
                if (!isNaN(Number(section.units))) {
                    totalUnits += Number(section.units);
                }
            }
        }

        return totalUnits;
    };

    getGrid = () => {
        const scheduleName = this.state.scheduleNames[AppStore.getCurrentScheduleIndex()];
        const scheduleUnits = this.getTotalUnits();
        const NOTE_MAX_LEN = 5000;

        return (
            <>
                <div className={this.props.classes.titleRow}>
                    <Typography variant="h6">{`${scheduleName} (${scheduleUnits} Units)`}</Typography>

                    <div>
                        <PopupState variant="popover">
                            {(popupState) => (
                                <>
                                    <Button variant="outlined" {...bindTrigger(popupState)}>
                                        Copy Schedule
                                    </Button>
                                    <Menu {...bindMenu(popupState)}>
                                        {this.state.scheduleNames.map((name, index) => {
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
                                                copySchedule(this.state.scheduleNames.length);
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
                            className={this.props.classes.clearSchedule}
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
                {this.state.courses.map((course) => {
                    return (
                        <Grid item md={12} xs={12} key={course.deptCode + course.courseNumber}>
                            <SectionTableLazyWrapper
                                classes={this.props.classes}
                                courseDetails={course}
                                term={course.term}
                                colorAndDelete={true}
                                highlightAdded={false}
                                analyticsCategory={analyticsEnum.addedClasses.title}
                                scheduleNames={this.state.scheduleNames}
                            />
                        </Grid>
                    );
                })}
                {this.state.customEvents.length > 0 && <Typography variant="h6">Custom Events</Typography>}
                {this.state.customEvents.map((customEvent) => {
                    return (
                        <Grid item md={12} xs={12} key={customEvent.title}>
                            <CustomEventDetailView
                                customEvent={customEvent}
                                currentScheduleIndex={AppStore.getCurrentScheduleIndex()}
                                scheduleNames={this.state.scheduleNames}
                            />
                        </Grid>
                    );
                })}
                <Typography variant="h6">Schedule Notes</Typography>
                <Paper className={this.props.classes.scheduleNoteContainer}>
                    <TextField
                        type="text"
                        placeholder="This schedule does not have any notes! Click here to start typing!"
                        onChange={this.handleNoteChange}
                        value={this.state.scheduleNote}
                        inputProps={{ maxLength: NOTE_MAX_LEN }}
                        InputProps={{ disableUnderline: true }}
                        fullWidth
                        multiline
                    />
                </Paper>
            </>
        );
    };

    getBarebonesSchedule = () => {
        const sectionsByTerm = AppStore.getBarebonesSchedule().courses.reduce(
            (acc: Record<string, string[]>, course) => {
                if (!acc[course.term]) {
                    acc[course.term] = [];
                }
                acc[course.term].push(course.sectionCode);
                return acc;
            }, {});

        return (
            <>
                {
                    //Sections organized under terms, in case the schedule contains multiple terms
                    Object.entries(sectionsByTerm).map(([term, sections]) => {
                        return (
                            <>
                                <Typography variant="h6">{term}</Typography>
                                <Paper key={term} elevation={1}>
                                    <Grid item md={12} xs={12} key={term} style={{padding: "15px 0px 15px"}}>
                                        <Typography variant="body1">
                                            Sections enrolled: {sections.join(', ')}
                                        </Typography>
                                    </Grid>
                                </Paper>
                            </>

                        );
                    })
                }
                <Typography variant="body1">
                    PeterPortal or WebSoc is currently unreachable.
                    This is the information that we can currently retrieve.
                </Typography>
            </>
        )
    }

    barebonesModeChange = () => {
        this.setState({ barebonesMode: AppStore.getBarebonesMode() }, () => console.log(this.state.barebonesMode));
    }

    render() {
        return (
            this.state.barebonesMode ?
                this.getBarebonesSchedule()
                :
                <Grid container spacing={2}>
                    {this.getGrid()}
                </Grid>
        );
    }
}

export default withStyles(styles)(AddedCoursePane);
