import AppStore from '../../stores/AppStore';
import React, { Fragment, PureComponent } from 'react';
import { Grid, Typography, Button, Menu, MenuItem } from '@material-ui/core';
import SectionTable from '../SectionTable/SectionTable.js';
import { withStyles } from '@material-ui/core/styles';
import CustomEventDetailView from './CustomEventDetailView';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { clearSchedules, copySchedule } from '../../actions/AppStoreActions';
import ReactGA from 'react-ga';

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

class AddedCoursePane extends PureComponent {
    state = {
        courses: [],
        customEvents: [],
        totalUnits: 0,
    };

    componentDidMount = () => {
        this.loadCourses();
        this.loadCustomEvents();
        AppStore.on('addedCoursesChange', this.loadCourses);
        AppStore.on('customEventsChange', this.loadCustomEvents);
        AppStore.on('currentScheduleIndexChange', this.loadCourses);
        AppStore.on('currentScheduleIndexChange', this.loadCustomEvents);
    };

    componentWillUnmount() {
        AppStore.removeListener('addedCoursesChange', this.loadCourses);
        AppStore.removeListener('customEventsChange', this.loadCustomEvents);
        AppStore.removeListener('currentScheduleIndexChange', this.loadCourses);
        AppStore.removeListener('currentScheduleIndexChange', this.loadCustomEvents);
    }

    loadCourses = () => {
        const addedCourses = AppStore.getAddedCourses();
        let totalUnits = 0;
        const formattedCourses = [];

        for (const addedCourse of addedCourses) {
            if (addedCourse.scheduleIndices.includes(AppStore.getCurrentScheduleIndex())) {
                let formattedCourse = formattedCourses.find(
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
                return a.sectionCode - b.sectionCode;
            });
        });
        this.setState({ courses: formattedCourses, totalUnits });
    };

    loadCustomEvents = () => {
        this.setState({ customEvents: AppStore.getCustomEvents() });
    };

    getGrid = () => {
        return (
            <Fragment>
                <div className={this.props.classes.titleRow}>
                    <Typography variant="h6">
                        {`Schedule ${AppStore.getCurrentScheduleIndex() + 1} (${this.state.totalUnits} Units)`}
                    </Typography>

                    <div>
                        <PopupState variant="popover">
                            {(popupState) => (
                                <Fragment>
                                    <Button variant="outlined" {...bindTrigger(popupState)}>
                                        Copy Schedule
                                    </Button>
                                    <Menu {...bindMenu(popupState)}>
                                        {[0, 1, 2, 3].map((index) => {
                                            return (
                                                <MenuItem
                                                    key={index}
                                                    disabled={AppStore.getCurrentScheduleIndex() === index}
                                                    onClick={() => {
                                                        copySchedule(AppStore.getCurrentScheduleIndex(), index);
                                                        popupState.close();
                                                    }}
                                                >
                                                    Copy to Schedule {index + 1}
                                                </MenuItem>
                                            );
                                        })}
                                        <MenuItem
                                            onClick={() => {
                                                copySchedule(AppStore.getCurrentScheduleIndex(), 4);
                                                popupState.close();
                                            }}
                                        >
                                            Copy to All Schedules
                                        </MenuItem>
                                    </Menu>
                                </Fragment>
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
                                    ReactGA.event({
                                        category: 'antalmanac-rewrite',
                                        action: 'Click Clear button',
                                        label: 'Added Course pane',
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
                            <SectionTable courseDetails={course} term={course.term} colorAndDelete={true} />
                        </Grid>
                    );
                })}
                <Typography variant="h6">Custom Events</Typography>
                {this.state.customEvents.map((customEvent) => {
                    if (customEvent.scheduleIndices.includes(AppStore.getCurrentScheduleIndex())) {
                        return (
                            <Grid item md={12} xs={12} key={customEvent.title}>
                                <CustomEventDetailView
                                    customEvent={customEvent}
                                    currentScheduleIndex={AppStore.getCurrentScheduleIndex()}
                                />
                            </Grid>
                        );
                    }
                    return null;
                })}
            </Fragment>
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
