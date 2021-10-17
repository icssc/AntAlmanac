import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { withStyles } from '@material-ui/core/styles';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Popper } from '@material-ui/core';
import './calendar.css';
import CalendarPaneToolbar from './CalendarPaneToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import AppStore from '../../stores/AppStore';
import ReactGA from 'react-ga';

const localizer = momentLocalizer(moment);

const styles = {
    container: {
        margin: '0px 4px 4px 4px',
        borderRadius: '1px',
    },
    firstLineContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        fontWeight: 500,
        fontSize: '0.8rem',
    },
    sectionType: {
        fontSize: '0.8rem',
    },
    secondLineContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
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
                    <div className={classes.sectionType}> {actualEvent.sectionType}</div>
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

class ScheduleCalendar extends PureComponent {
    state = {
        screenshotting: false,
        anchorEvent: null,
        showFinalsSchedule: false,
        moreInfoOpen: false,
        courseInMoreInfo: null,
        calendarEventKey: null,
        eventsInCalendar: AppStore.getEventsInCalendar(),
        finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    static eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.color,
                cursor: 'pointer',
                borderStyle: 'none',
                borderRadius: '4px',
                color: this.colorContrastSufficient(event.color) ? 'white' : 'black',
            },
        };
    };

    static colorContrastSufficient = (bg) => {
        // This equation is taken from w3c, does not use the colour difference part
        const minBrightnessDiff = 125;

        let bgRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg); // returns {hex, r, g, b}
        bgRgb = { r: parseInt(bgRgb[1], 16), g: parseInt(bgRgb[2], 16), b: parseInt(bgRgb[3], 16) };
        let textRgb = { r: 255, g: 255, b: 255 }; // white text

        const getBrightness = (color) => {
            return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
        };

        const bgBrightness = getBrightness(bgRgb);
        const textBrightness = getBrightness(textRgb);
        return Math.abs(bgBrightness - textBrightness) > minBrightnessDiff;
    };

    toggleDisplayFinalsSchedule = () => {
        this.handleClosePopover();

        this.setState((prevState) => {
            return { showFinalsSchedule: !prevState.showFinalsSchedule };
        });
    };

    updateCurrentScheduleIndex = () => {
        this.handleClosePopover();

        this.setState({
            currentScheduleIndex: AppStore.currentScheduleIndex,
        });
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
            finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on('customEventsChange', this.updateEventsInCalendar);
        AppStore.on('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    componentWillUnmount = () => {
        AppStore.removeListener('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.removeListener('customEventsChange', this.updateEventsInCalendar);
        AppStore.removeListener('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
    };

    handleTakeScreenshot = async (html2CanvasScreenshot) => {
        // This function takes a screenshot of the user's schedule
        // Before we take the screenshot, we need to make some adjustments to the canvas:
        //  - Set the color to black, so that the weekdays/times still appear when Dark Mode is on
        //  - Remove the right margin on the calendar header, so the extra area for the scrollbar is removed

        // Fetch the canvas and calendarHeader
        const canvas = document.getElementById('screenshot');
        const calendarHeader = ReactDOM.findDOMNode(this).getElementsByClassName('rbc-time-header')[0];

        // Save the current styling, so we can add it back afterwards
        const oldColor = canvas.style.color;
        const oldMargin = calendarHeader.style.marginRight;

        // Update the canvas and calendar header for the picture
        canvas.style.color = 'black';
        calendarHeader.style.marginRight = '0px';

        this.setState({ screenshotting: true }, async () => {
            // Take the picture
            await html2CanvasScreenshot();

            // Revert the temporary changes to the canvas and calendar
            canvas.style.color = oldColor;
            calendarHeader.style.marginRight = oldMargin;

            this.setState({ screenshotting: false });
        });
        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'screenshot',
        });
    };

    handleEventClick = (courseInMoreInfo, event) => {
        const { currentTarget } = event;
        event.stopPropagation();

        if (courseInMoreInfo.sectionType !== 'Fin') {
            this.setState({
                anchorEvent: currentTarget,
                courseInMoreInfo: courseInMoreInfo,
                calendarEventKey: Math.random(),
            });
        }
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
                event.scheduleIndices.includes(this.state.currentScheduleIndex) || event.scheduleIndices.length === 4
        );
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.container} onClick={this.handleClosePopover}>
                <CalendarPaneToolbar
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                    toggleDisplayFinalsSchedule={this.toggleDisplayFinalsSchedule}
                    showFinalsSchedule={this.state.showFinalsSchedule}
                />
                <div
                    id="screenshot"
                    style={
                        !this.state.screenshotting
                            ? { height: `calc(100vh - 104px)` }
                            : {
                                  height: '100%',
                                  width: '1000px',
                              }
                    }
                >
                    <Popper
                        anchorEl={this.state.anchorEvent}
                        placement="right"
                        modifiers={{
                            offset: {
                                enabled: true,
                                offset: '0, 10',
                            },
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
                            key={this.state.calendarEventKey}
                            closePopover={this.handleClosePopover}
                            courseInMoreInfo={this.state.courseInMoreInfo}
                            currentScheduleIndex={this.state.currentScheduleIndex}
                        />
                    </Popper>
                    <Calendar
                        localizer={localizer}
                        toolbar={false}
                        formats={{
                            timeGutterFormat: (date, culture, localizer) =>
                                date.getMinutes() > 0 ? '' : localizer.format(date, 'h A', culture),
                            dayFormat: 'ddd',
                        }}
                        defaultView={Views.WORK_WEEK}
                        views={[Views.WORK_WEEK]}
                        step={15}
                        timeslots={2}
                        defaultDate={new Date(2018, 0, 1)}
                        min={new Date(2018, 0, 1, 7)}
                        max={new Date(2018, 0, 1, 23)}
                        events={this.getEventsForCalendar()}
                        eventPropGetter={ScheduleCalendar.eventStyleGetter}
                        showMultiDayTimes={false}
                        components={{ event: CustomEvent({ classes }) }}
                        onSelectEvent={this.handleEventClick}
                    />
                </div>
            </div>
        );
    }
}

ScheduleCalendar.propTypes = {};

export default withStyles(styles)(ScheduleCalendar);
