import AppStore from '../../stores/AppStore';
import React, { Component, Fragment } from 'react';
import { Grid, Typography, Button, Menu, MenuItem } from '@material-ui/core';
import SectionTable from '../SectionTable/SectionTable.js';
import { withStyles } from '@material-ui/core/styles';
import CustomEventDetailView from './CustomEventDetailView';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { copySchedule } from '../../actions/AppStoreActions';

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
};

class AddedCoursePane extends Component {
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
        AppStore.removeListener(
            'currentScheduleIndexChange',
            this.loadCustomEvents
        );
    }

    loadCourses = () => {
        const addedCourses = AppStore.getAddedCourses();
        let totalUnits = 0;
        const formattedCourses = [];

        for (const addedCourse of addedCourses) {
            if (
                addedCourse.scheduleIndices.includes(
                    AppStore.getCurrentScheduleIndex()
                )
            ) {
                let formattedCourse = formattedCourses.find(
                    (needleCourse) =>
                        needleCourse.courseNumber ===
                            addedCourse.courseNumber &&
                        needleCourse.deptCode === addedCourse.deptCode
                );

                if (formattedCourse) {
                    formattedCourse.sections.push({
                        ...addedCourse.section,
                        color: addedCourse.color,
                    });
                } else {
                    formattedCourse = {
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

                if (!isNaN(Number(addedCourse.section.units)))
                    totalUnits += Number(addedCourse.section.units);
            }
        }
        formattedCourses.forEach(function(course) {
            course.sections.sort(function(a, b) {
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
                        {`Schedule ${AppStore.getCurrentScheduleIndex() + 1} (${
                            this.state.totalUnits
                        } Units)`}
                    </Typography>

                    <PopupState variant="popover" popupId="demo-popup-menu">
                        {(popupState) => (
                            <React.Fragment>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    {...bindTrigger(popupState)}
                                >
                                    Copy Schedule
                                </Button>
                                <Menu {...bindMenu(popupState)}>
                                    {[0, 1, 2, 3].map((index) => {
                                        return (
                                            <MenuItem
                                                disabled={
                                                    AppStore.getCurrentScheduleIndex() ===
                                                    index
                                                }
                                                onClick={() => {
                                                    console.log(index);
                                                    copySchedule(
                                                        AppStore.getCurrentScheduleIndex(),
                                                        index
                                                    );
                                                    popupState.close();
                                                }}
                                            >
                                                Copy to Schedule {index + 1}
                                            </MenuItem>
                                        );
                                    })}
                                    <MenuItem
                                        onClick={() => {
                                            copySchedule(
                                                AppStore.getCurrentScheduleIndex(),
                                                4
                                            );
                                            popupState.close();
                                        }}
                                    >
                                        Copy to All Schedules
                                    </MenuItem>
                                </Menu>
                            </React.Fragment>
                        )}
                    </PopupState>
                </div>
                {this.state.courses.map((course) => {
                    return (
                        <Grid item md={12} xs={12}>
                            <SectionTable
                                courseDetails={course}
                                term={course.term}
                                colorAndDelete={true}
                            />
                        </Grid>
                    );
                })}
                <Typography variant="h6">Custom Events</Typography>
                {this.state.customEvents.map((customEvent) => {
                    if (
                        customEvent.scheduleIndices.includes(
                            AppStore.getCurrentScheduleIndex()
                        )
                    ) {
                        return (
                            <Grid item md={12} xs={12}>
                                <CustomEventDetailView
                                    customEvent={customEvent}
                                    currentScheduleIndex={AppStore.getCurrentScheduleIndex()}
                                />
                            </Grid>
                        );
                    }
                })}
            </Fragment>
        );
    };

    render() {
        const { classes } = this.props;
        return (
            <div>
                <Grid container spacing={16}>
                    {this.getGrid()}
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(AddedCoursePane);
