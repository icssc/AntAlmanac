import { Button, Grid, Menu, MenuItem,Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import React, { PureComponent } from 'react';

import { clearSchedules, copySchedule } from '../../../actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '../../../analytics';
import { AACourse } from '../../../peterportal.types';
import AppStore from '../../../stores/AppStore';
import { RepeatingCustomEvent } from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ScheduleNote from '../CoursePane/SearchForm/ScheduleNote';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import CustomEventDetailView from './CustomEventDetailView';

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
    term: string;
}

interface AddedCoursePaneProps {
    classes: ClassNameMap;
}

interface AddedCoursePaneState {
    courses: CourseWithTerm[];
    customEvents: RepeatingCustomEvent[];
    totalUnits: number;
    scheduleNames: string[];
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
        const addedCourses = AppStore.getAddedCourses();
        let totalUnits = 0;
        const formattedCourses: CourseWithTerm[] = [];

        for (const addedCourse of addedCourses) {
            if (addedCourse.scheduleIndices.includes(AppStore.getCurrentScheduleIndex())) {
                let formattedCourse: CourseWithTerm | undefined = formattedCourses.find(
                    (needleCourse) =>
                        needleCourse.courseNumber === addedCourse.courseNumber &&
                        needleCourse.deptCode === addedCourse.deptCode
                );

                if (formattedCourse) {
                    formattedCourse.sections.push({
                        ...addedCourse.section,
                        color: addedCourse.color,
                    });
                } else {
                    formattedCourse = {
                        term: addedCourse.term,
                        deptCode: addedCourse.deptCode,
                        courseComment: addedCourse.courseComment,
                        prerequisiteLink: addedCourse.prerequisiteLink,
                        courseNumber: addedCourse.courseNumber,
                        courseTitle: addedCourse.courseTitle,
                        sections: [
                            {
                                ...addedCourse.section,
                                color: addedCourse.color,
                            },
                        ],
                    };
                    formattedCourses.push(formattedCourse);
                }

                if (!isNaN(Number(addedCourse.section.units))) totalUnits += Number(addedCourse.section.units);
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
        this.setState({ customEvents: AppStore.getCustomEvents() });
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
                                                        copySchedule(AppStore.getCurrentScheduleIndex(), index);
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
                                                    AppStore.getCurrentScheduleIndex(),
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
                                    clearSchedules([AppStore.getCurrentScheduleIndex()]);
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
                    if (customEvent.scheduleIndices.includes(AppStore.getCurrentScheduleIndex())) {
                        return (
                            <Grid item md={12} xs={12} key={customEvent.title}>
                                <CustomEventDetailView
                                    customEvent={customEvent}
                                    currentScheduleIndex={AppStore.getCurrentScheduleIndex()}
                                    scheduleNames={this.state.scheduleNames}
                                />
                            </Grid>
                        );
                    }
                    return null;
                })}
                <Typography variant="h6">{`${scheduleName} Notes`}</Typography>
                <ScheduleNote />
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
