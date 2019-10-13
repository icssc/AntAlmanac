import AppStore from '../../stores/AppStore';
import React, { Component, Fragment } from 'react';
import { Grid, Typography } from '@material-ui/core';
import SectionTable from '../SectionTable/SectionTable.js';
import { withStyles } from '@material-ui/core/styles';
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
        display: 'inline-flex',
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
                    formattedCourse.sections.push(addedCourse.section);
                } else {
                    formattedCourse = {
                        deptCode: addedCourse.deptCode,
                        courseComment: addedCourse.courseComment,
                        prerequisiteLink: addedCourse.prerequisiteLink,
                        courseNumber: addedCourse.courseNumber,
                        courseTitle: addedCourse.courseTitle,
                        sections: [addedCourse.section],
                    };
                    formattedCourses.push(formattedCourse);
                }

                if (!isNaN(Number(addedCourse.section.units)))
                    totalUnits += Number(addedCourse.section.units);
            }
        }
        //formattedCourses.sections.sort(function(a,b) {return a.sectionCode - b.sectionCode})
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
                </div>
                {this.state.courses.map((course) => {
                    return (
                        <Grid item md={12} xs={12}>
                            <SectionTable
                                courseDetails={course}
                                term={course.term}
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
                {this.state.courses.length === 0 &&
                this.state.customEvents.length === 0 ? (
                    <div className={classes.container}>
                        <p>
                            There's nothing here yet ... because you haven't
                            added anything to your calendar yet!
                            <br />
                            Go to class search to find classes to put into your
                            schedules, then come back here to see details on all
                            your listed classes!
                        </p>
                    </div>
                ) : (
                    <Grid container spacing={16}>
                        {this.getGrid()}
                    </Grid>
                )}
            </div>
        );
    }
}

export default withStyles(styles)(AddedCoursePane);
