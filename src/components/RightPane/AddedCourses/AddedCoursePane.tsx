import AppStore from '../../../stores/AppStore';
import React, { PureComponent } from 'react';
import { Grid, Typography, Button, Menu, MenuItem } from '@material-ui/core';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import { withStyles } from '@material-ui/core/styles';
import CustomEventDetailView from './CustomEventDetailView';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { clearSchedules, copySchedule } from '../../../actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '../../../analytics';
import { AACourse } from '../../../peterportal.types';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { RepeatingCustomEvent } from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

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
};

interface CourseWithTerm extends AACourse {
    term: string
}

interface AddedCoursePaneProps {
    classes: ClassNameMap
}

interface AddedCoursePaneState {
    courses: CourseWithTerm[]
    customEvents: RepeatingCustomEvent[]
    totalUnits: number
    scheduleNames: string[]
}

class AddedCoursePane extends PureComponent<AddedCoursePaneProps, AddedCoursePaneState> {
    state: AddedCoursePaneState = {
        courses: [],
        customEvents: [],
        totalUnits: 0,
        scheduleNames: AppStore.getScheduleNames(),
    };

    componentDidMount = () => {
        this.loadCourses();
        this.loadCustomEvents();
        AppStore.on('addedCoursesChange', this.loadCourses);
        AppStore.on('customEventsChange', this.loadCustomEvents);
        AppStore.on('currentScheduleIndexChange', this.loadCourses);
        AppStore.on('currentScheduleIndexChange', this.loadCustomEvents);
        AppStore.on('scheduleNamesChange', this.loadScheduleNames);
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
    }


    loadCourses = () => {
        const currentCourses = AppStore.schedule.getCurrentCourses();
        let totalUnits = 0;
        const formattedCourses: CourseWithTerm[] = [];

        for (const course of currentCourses) {
            let formattedCourse: CourseWithTerm|undefined = formattedCourses.find(
                (needleCourse) =>
                    needleCourse.courseNumber === course.courseNumber &&
                    needleCourse.deptCode === course.deptCode
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

                if (!isNaN(Number(course.section.units))) totalUnits += Number(course.section.units);
            }
        }
        formattedCourses.forEach(function (course) {
            course.sections.sort(function (a, b) {
                return parseInt(a.sectionCode) - parseInt(b.sectionCode);
            });
        });
        this.setState({ courses: formattedCourses, totalUnits });
    };

    loadCustomEvents = () => {
        this.setState({ customEvents: AppStore.schedule.getCurrentCustomEvents() });
        // Force update required because the state has a reference to custom events
        // so it doesn't see differences all the time
        this.forceUpdate()
    };

    loadScheduleNames = () => {
        this.setState({ scheduleNames: AppStore.getScheduleNames() });
    };

    getGrid = () => {
        const scheduleName = this.state.scheduleNames[AppStore.getCurrentScheduleIndex()];
        const scheduleUnits = this.state.totalUnits;

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
                                                copySchedule(
                                                    this.state.scheduleNames.length
                                                );
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
            </>
        );
    };

    render() {
        return (
            <Grid container spacing={2}>
                {this.getGrid()}
            </Grid>
        );
    }
}

export default withStyles(styles)(AddedCoursePane);
