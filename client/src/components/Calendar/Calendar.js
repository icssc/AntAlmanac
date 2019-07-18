import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import { withStyles } from '@material-ui/core/styles';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Popper } from '@material-ui/core';
import './calendar.css';
import CalendarPaneToolbar from './CalendarPaneToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import AppStore from '../../stores/AppStore';

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
        showFinalsSchedule: false,
        moreInfoOpen: false,
        courseInMoreInfo: null,
        eventsInCalendar: [],
        finalsEventsInCalendar: [],
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

    calendarizeCourseEvents = () => {
        const addedCourses = AppStore.getAddedCourses();
        const courseEventsInCalendar = [];

        for (const course of addedCourses) {
            for (const meeting of course.section.meetings) {
                const timeString = meeting.time.replace(/\s/g, '');

                if (timeString !== 'TBA') {
                    let [
                        ,
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

                            courseEventsInCalendar.push(newEvent);
                        }
                    });
                }
            }
        }

        this.setState({
            eventsInCalendar: courseEventsInCalendar,
        });
    };

    calendarizeFinals = () => {
        const addedCourses = AppStore.getAddedCourses();
        let finalsEventsInCalendar = [];

        for (const course of addedCourses) {
            const finalExam = course.section.finalExam;
            console.log(finalExam);

            if (finalExam.length > 5) {
                let [
                    ,
                    date,
                    ,
                    ,
                    start,
                    startMin,
                    end,
                    endMin,
                    ampm,
                ] = finalExam.match(
                    /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(pm?)/
                );
                start = parseInt(start, 10);
                startMin = parseInt(startMin, 10);
                end = parseInt(end, 10);
                endMin = parseInt(endMin, 10);
                date = [
                    date.includes('Mon'),
                    date.includes('Tue'),
                    date.includes('Wed'),
                    date.includes('Thu'),
                    date.includes('Fri'),
                ];
                if (ampm === 'pm' && end !== 12) {
                    start += 12;
                    end += 12;
                    if (start > end) start -= 12;
                }

                date.forEach((shouldBeInCal, index) => {
                    if (shouldBeInCal)
                        finalsEventsInCalendar.push({
                            title: course.title,
                            sectionCode: course.section.sectionCode,
                            sectionType: 'Fin',
                            bldg: course.section.meetings[0].bldg,
                            color: course.color,
                            scheduleIndices: course.scheduleIndices,
                            start: new Date(
                                2018,
                                0,
                                index + 1,
                                start,
                                startMin
                            ),
                            end: new Date(2018, 0, index + 1, end, endMin),
                        });
                });
            }
        }

        this.setState({
            finalsEventsInCalendar: finalsEventsInCalendar,
        });
    };

    toggleDisplayFinalsSchedule = () => {
        this.setState((prevState) => {
            return { showFinalsSchedule: !prevState.showFinalsSchedule };
        });
    };

    calendarizeCustomEvents = () => {
        const customEvents = AppStore.getCustomEvents();
        const customEventsInCalendar = [];

        for (const customEvent of customEvents) {
            for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                if (customEvent.days[dayIndex] === true) {
                    const startHour = parseInt(
                        customEvent.start.slice(0, 2),
                        10
                    );
                    const startMin = parseInt(
                        customEvent.start.slice(3, 5),
                        10
                    );
                    const endHour = parseInt(customEvent.end.slice(0, 2), 10);
                    const endMin = parseInt(customEvent.end.slice(3, 5), 10);

                    customEventsInCalendar.push({
                        customEventID: customEvent.customEventID,
                        color: customEvent.color,
                        start: new Date(
                            2018,
                            0,
                            dayIndex + 1,
                            startHour,
                            startMin
                        ),
                        isCustomEvent: true,
                        end: new Date(2018, 0, dayIndex + 1, endHour, endMin),
                        scheduleIndices: customEvent.scheduleIndices,
                        title: customEvent.title,
                    });
                }
            }
        }
        this.setState((prevState) => {
            return {
                eventsInCalendar: prevState.eventsInCalendar.concat(
                    customEventsInCalendar
                ),
            };
        });
    };

    updateCurrentScheduleIndex = () => {
        this.setState({
            currentScheduleIndex: AppStore.currentScheduleIndex,
        });
    };

    calendarizeEvents = () => {
        this.calendarizeCourseEvents();
        this.calendarizeCustomEvents();
        this.calendarizeFinals();
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.calendarizeEvents);
        AppStore.on('customEventsChange', this.calendarizeEvents);
        AppStore.on(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    componentWillUnmount = () => {
        AppStore.removeListener('addedCoursesChange', this.calendarizeEvents);
        AppStore.removeListener('customEventsChange', this.calendarizeEvents);
        AppStore.removeListener(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    handleTakeScreenshot = async (html2CanvasScreenshot) => {
        this.setState({ screenshotting: true }, async () => {
            await html2CanvasScreenshot();
            this.setState({ screenshotting: false });
        });
    };

    handleEventClick = (courseInMoreInfo, event) => {
        const { currentTarget } = event;
        event.stopPropagation();

        if (courseInMoreInfo.sectionType !== 'Fin')
            this.setState((state) => ({
                anchorEvent: Boolean(state.anchorEvent) ? null : currentTarget,
                courseInMoreInfo: courseInMoreInfo,
            }));
    };

    handleClosePopover = () => {
        this.setState({ anchorEvent: null });
    };

    getEventsForCalendar = () => {
        const eventSet = this.state.showFinalsSchedule
            ? this.state.finalsEventsInCalendar
            : this.state.eventsInCalendar;

        return eventSet.filter(
            (event) =>
                event.scheduleIndices.includes(
                    this.state.currentScheduleIndex
                ) || event.scheduleIndices.length === 4
        );
    };

    render() {
        const { classes } = this.props;
        return (
            <div
                className={classes.container}
                onClick={this.handleClosePopover}
            >
                <CalendarPaneToolbar
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                    toggleDisplayFinalsSchedule={
                        this.toggleDisplayFinalsSchedule
                    }
                    showFinalsSchedule={this.state.showFinalsSchedule}
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
                                // onColorChange={this.props.onColorChange}
                                currentScheduleIndex={
                                    this.state.currentScheduleIndex
                                }
                                // onEditCustomEvent={this.props.onEditCustomEvent}
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
                            events={this.getEventsForCalendar()}
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
