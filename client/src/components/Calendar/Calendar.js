import React, { Component, Fragment } from 'react';
import BigCalendar from 'react-big-calendar';
import { withStyles } from '@material-ui/core/styles';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Popper } from '@material-ui/core';
import PropTypes from 'prop-types';
import './calendar.css';
import CalendarPaneToolbar from './CalendarPaneToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import MobileCalendar from './MobileCalendar';

import AppStore from '../../stores/AppStore';
import { addCourse } from '../../actions/AppStoreActions';

BigCalendar.momentLocalizer(moment);

const styles = {
    container: {
        margin: '0px 4px 4px 4px',
    },
    firstLineContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        fontWeight: 500,
        fontSize: '0.85rem',
    },
    sectionType: {
        fontSize: '0.8rem',
    },
    secondLineContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
    },
    customEventContainer: {
        marginTop: 2,
        marginBottom: 2,
        fontSize: '0.85rem',
    },
    customEventTitle: {
        fontWeight: 500,
    },
};

const CustomEvent = ({ classes }) => (event) => {
    const actualEvent = event.event;

    if (!actualEvent.isCustomEvent)
        return (
            <div>
                <div className={classes.firstLineContainer}>
                    <div> {actualEvent.title}</div>
                    <div className={classes.sectionType}>
                        {' '}
                        {actualEvent.sectionType}
                    </div>
                </div>
                <div className={classes.secondLineContainer}>
                    <div>{actualEvent.bldg}</div>
                    <div>{actualEvent.sectionCode}</div>
                </div>
            </div>
        );
    else {
        return (
            <div className={classes.customEventContainer}>
                <div className={classes.customEventTitle}>{event.title}</div>
            </div>
        );
    }
};

class Calendar extends Component {
    state = {
        screenshotting: false,
        anchorEvent: null,
        moreInfoOpen: false,
        courseInMoreInfo: null,
        eventsInCalendar: [],
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    static eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.color,
                cursor: 'pointer',
                borderStyle: 'none',
                borderRadius: 0,
            },
        };
    };

    calendarizeEvents = () => {
        const addedCourses = AppStore.getAddedCourses();
        const eventsInCalendar = [];

        for (let course of addedCourses) {
            for (let meeting of course.section.meetings) {
                const timeString = meeting.time.replace(/\s/g, '');

                if (timeString !== 'TBA') {
                    let [
                        _,
                        startHr,
                        startMin,
                        endHr,
                        endMin,
                        ampm,
                    ] = timeString.match(
                        /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
                    );

                    startHr = parseInt(startHr, 10);
                    startMin = parseInt(startMin, 10);
                    endHr = parseInt(endHr, 10);
                    endMin = parseInt(endMin, 10);

                    let dates = [
                        meeting.days.includes('M'),
                        meeting.days.includes('Tu'),
                        meeting.days.includes('W'),
                        meeting.days.includes('Th'),
                        meeting.days.includes('F'),
                    ];

                    if (ampm === 'p' && endHr !== 12) {
                        startHr += 12;
                        endHr += 12;
                        if (startHr > endHr) startHr -= 12;
                    }

                    dates.forEach((shouldBeInCal, index) => {
                        if (shouldBeInCal) {
                            const newEvent = {
                                color: course.color,
                                // term: term,
                                title:
                                    course.deptCode + ' ' + course.courseNumber,
                                courseTitle: course.courseTitle,
                                bldg: meeting.bldg,
                                finalExam: course.finalExam,
                                instructors: course.section.instructors,
                                sectionCode: course.section.sectionCode,
                                sectionType: course.section.sectionType,
                                start: new Date(
                                    2018,
                                    0,
                                    index + 1,
                                    startHr,
                                    startMin
                                ),
                                end: new Date(
                                    2018,
                                    0,
                                    index + 1,
                                    endHr,
                                    endMin
                                ),
                                isCustomEvent: false,
                                scheduleIndices: course.scheduleIndices,
                            };

                            eventsInCalendar.push(newEvent);
                        }
                    });
                }
            }
        }

        this.setState({ eventsInCalendar: eventsInCalendar });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.calendarizeEvents);

        AppStore.on('currentScheduleIndexChange', () => {
            this.setState({
                currentScheduleIndex: AppStore.currentScheduleIndex,
            });
        });
    };

    componentWillUnmount() {
        AppStore.removeListener('addedCoursesChange', this.calendarizeEvents);
        AppStore.removeListener('currentScheduleIndexChange', () => {
            this.setState({
                currentScheduleIndex: AppStore.currentScheduleIndex,
            });
        });
    }

    handleTakeScreenshot = async (html2CanvasScreenshot) => {
        this.setState({ screenshotting: true }, async () => {
            await html2CanvasScreenshot();
            this.setState({ screenshotting: false });
        });
    };

    handleEventClick = (courseInMoreInfo, event) => {
        const { currentTarget } = event;
        event.stopPropagation();

        if (courseInMoreInfo.courseType !== 'Fin')
            this.setState((state) => ({
                anchorEvent: Boolean(state.anchorEvent) ? null : currentTarget,
                courseInMoreInfo: courseInMoreInfo,
            }));
    };

    handleClosePopover = () => {
        this.setState({ anchorEvent: null });
    };

    render() {
        const { classes } = this.props;
        return (
            <div
                className={classes.container}
                onClick={this.handleClosePopover}
            >
                <CalendarPaneToolbar
                    // onUndo={this.props.onUndo}
                    // onAddCustomEvent={this.props.onAddCustomEvent}
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                    // eventsInCalendar={this.props.eventsInCalendar}
                    // showFinalSchedule={this.props.showFinalSchedule}
                    // displayFinal={this.props.displayFinal}
                />
                <div>
                    <div
                        id="screenshot"
                        style={
                            !this.state.screenshotting
                                ? {
                                      height: `calc(100vh - 96px - 12px - ${
                                          this.props.isDesktop ? '0px' : '48px'
                                      })`,
                                  }
                                : {
                                      height: `${
                                          this.props.isDesktop
                                              ? '100%'
                                              : '100vh'
                                      }`,
                                      display: `${
                                          this.props.isDesktop
                                              ? 'null'
                                              : 'inline-block'
                                      }`,
                                  }
                        }
                    >
                        <Popper
                            anchorEl={this.state.anchorEvent}
                            placement="right"
                            modifiers={{
                                flip: {
                                    enabled: true,
                                },
                                preventOverflow: {
                                    enabled: true,
                                    boundariesElement: 'scrollParent',
                                },
                            }}
                            open={Boolean(this.state.anchorEvent)}
                        >
                            <CourseCalendarEvent
                                courseInMoreInfo={this.state.courseInMoreInfo}
                                onClassDelete={() =>
                                    this.props.onClassDelete(
                                        this.state.courseInMoreInfo
                                    )
                                }
                                onColorChange={this.props.onColorChange}
                                onEditCustomEvent={this.props.onEditCustomEvent}
                            />
                        </Popper>
                        <BigCalendar
                            toolbar={false}
                            formats={{
                                timeGutterFormat: (date, culture, localizer) =>
                                    date.getMinutes() > 0
                                        ? ''
                                        : localizer.format(
                                              date,
                                              'h A',
                                              culture
                                          ),
                                dayFormat: 'ddd',
                            }}
                            defaultView={BigCalendar.Views.WORK_WEEK}
                            views={[BigCalendar.Views.WORK_WEEK]}
                            step={15}
                            timeslots={2}
                            defaultDate={new Date(2018, 0, 1)}
                            min={new Date(2018, 0, 1, 7)}
                            max={new Date(2018, 0, 1, 23)}
                            events={this.state.eventsInCalendar.filter(
                                (event) =>
                                    event.scheduleIndices.includes(
                                        this.state.currentScheduleIndex
                                    ) || event.scheduleIndices.length === 4
                            )}
                            eventPropGetter={Calendar.eventStyleGetter}
                            showMultiDayTimes={false}
                            components={{ event: CustomEvent({ classes }) }}
                            onSelectEvent={this.handleEventClick}
                        />
                        {/*<Fragment/>*/}
                        {/*// <MobileCalendar*/}
                        {/*//     classEventsInCalendar={classEventsInCalendar}*/}
                        {/*//     EventBox={CustomEvent({ classes })}*/}
                        {/*//     onSelectEvent={this.handleEventClick}*/}
                        {/*// />*/}
                    </div>
                </div>
            </div>
        );
    }
}

Calendar.propTypes = {};

export default withStyles(styles)(Calendar);
