import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import { Popper } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap,Styles  } from '@material-ui/core/styles/withStyles';
import moment from 'moment';
import React, { PureComponent, SyntheticEvent } from 'react';
import { Calendar, DateLocalizer, momentLocalizer, Views } from 'react-big-calendar';
import ReactDOM from 'react-dom';

import AppStore from '../../stores/AppStore';
import CalendarToolbar from './CalendarToolbar';
import CourseCalendarEvent, { CalendarEvent } from './CourseCalendarEvent';

const localizer = momentLocalizer(moment);

/*
This is the composition structure of everything in components/Calendar, updated as of PR #411
I did the file restructure for the folder based on this tree, so thought I 
might as well include it since I made it. The file structure is close but doesn't
match exactly.

CalendarRoot
    CourseCalendarEvent
    CalendarToolbar
        CustomEventDialog
            DaySelector
            ScheduleSelector
        ScreenshotButton
        ExportCalendar
        ScheduleNameDialog (reused below)
        EditSchedule
            ScheduleNameDialog (reused above)
            DeleteScheduleDialog
*/

const styles: Styles<Theme, object> = {
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

const AntAlmanacEvent =
    (classes: ClassNameMap) =>
    // eslint-disable-next-line react/display-name
    ({ event }: { event: CalendarEvent }) => {
        if (!event.isCustomEvent)
            return (
                <div>
                    <div className={classes.firstLineContainer}>
                        <div> {event.title}</div>
                        <div className={classes.sectionType}> {event.sectionType}</div>
                    </div>
                    <div className={classes.secondLineContainer}>
                        <div>{event.bldg}</div>
                        <div>{event.sectionCode}</div>
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
interface ScheduleCalendarProps {
    classes: ClassNameMap;
    isMobile: boolean;
}

interface ScheduleCalendarState {
    screenshotting: boolean;
    anchorEl: HTMLElement | null;
    showFinalsSchedule: boolean;
    moreInfoOpen: false;
    courseInMoreInfo: CalendarEvent | null;
    calendarEventKey: number | null;
    eventsInCalendar: CalendarEvent[];
    finalsEventsInCalendar: CalendarEvent[];
    currentScheduleIndex: number;
    scheduleNames: string[];
}
class ScheduleCalendar extends PureComponent<ScheduleCalendarProps, ScheduleCalendarState> {
    state: ScheduleCalendarState = {
        screenshotting: false,
        anchorEl: null,
        showFinalsSchedule: false,
        moreInfoOpen: false,
        courseInMoreInfo: null,
        calendarEventKey: null,
        eventsInCalendar: AppStore.getEventsInCalendar(),
        finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
        scheduleNames: AppStore.getScheduleNames(),
    };

    static eventStyleGetter = (event: CalendarEvent) => {
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

    static colorContrastSufficient = (bg: string) => {
        // This equation is taken from w3c, does not use the colour difference part
        const minBrightnessDiff = 125;

        const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg) as RegExpExecArray; // returns {hex, r, g, b}
        const backgroundRGB = {
            r: parseInt(backgroundRegexResult[1], 16),
            g: parseInt(backgroundRegexResult[2], 16),
            b: parseInt(backgroundRegexResult[3], 16),
        } as const;
        const textRgb = { r: 255, g: 255, b: 255 }; // white text

        const getBrightness = (color: typeof backgroundRGB) => {
            return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
        };

        const bgBrightness = getBrightness(backgroundRGB);
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

    updateEventsInCalendar = (close = true) => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
            finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        });
        if (close) this.handleClosePopover();
    };

    updateScheduleNames = () => {
        this.setState({
            scheduleNames: AppStore.getScheduleNames(),
        });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on('customEventsChange', this.updateEventsInCalendar);
        AppStore.on('colorChange', this.updateEventsInCalendar);
        AppStore.on('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
        AppStore.on('scheduleNamesChange', this.updateScheduleNames);
    };

    componentWillUnmount = () => {
        AppStore.removeListener('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.removeListener('customEventsChange', this.updateEventsInCalendar);
        AppStore.removeListener('colorChange', this.updateEventsInCalendar);
        AppStore.removeListener('currentScheduleIndexChange', this.updateCurrentScheduleIndex);
        AppStore.removeListener('scheduleNamesChange', this.updateScheduleNames);
    };

    handleTakeScreenshot = (html2CanvasScreenshot: () => void) => {
        // This function takes a screenshot of the user's schedule
        // Before we take the screenshot, we need to make some adjustments to the canvas:
        //  - Set the color to black, so that the weekdays/times still appear when Dark Mode is on
        //  - Remove the right margin on the calendar header, so the extra area for the scrollbar is removed

        // Fetch the canvas and calendarHeader
        const canvas = document.getElementById('screenshot') as HTMLElement;

        // this disable only works because this isn't a functional component. It's kinda a hack
        // eslint-disable-next-line react/no-find-dom-node
        const headerNode = ReactDOM.findDOMNode(this) as Element;
        const calendarHeader = headerNode.getElementsByClassName('rbc-time-header')[0] as HTMLElement;

        // Save the current styling, so we can add it back afterwards
        const oldColor = canvas.style.color;
        const oldMargin = calendarHeader.style.marginRight;

        // Update the canvas and calendar header for the picture
        canvas.style.color = 'black';
        calendarHeader.style.marginRight = '0px';

        this.setState({ screenshotting: true }, () => {
            // Take the picture
            html2CanvasScreenshot();

            // Revert the temporary changes to the canvas and calendar
            canvas.style.color = oldColor;
            calendarHeader.style.marginRight = oldMargin;

            this.setState({ screenshotting: false });
        });
    };

    handleEventClick = (event: CalendarEvent, e: SyntheticEvent<HTMLElement, Event>) => {
        const { currentTarget } = e;
        e.stopPropagation();

        if (event.isCustomEvent || event.sectionType !== 'Fin') {
            this.setState({
                anchorEl: currentTarget,
                courseInMoreInfo: event,
                calendarEventKey: Math.random(),
            });
        }
    };

    handleClosePopover = () => {
        this.setState({ anchorEl: null });
    };

    getEventsForCalendar = () => {
        const eventSet = this.state.showFinalsSchedule
            ? this.state.finalsEventsInCalendar
            : this.state.eventsInCalendar;

        return eventSet.filter((event) => event.scheduleIndices.includes(this.state.currentScheduleIndex));
    };

    render() {
        const { classes, isMobile } = this.props;
        const events = this.getEventsForCalendar();
        const hasWeekendCourse = events.some((event) => event.start.getDay() === 0 || event.start.getDay() === 6);
        const calStyling = isMobile ? { height: `calc(100% - 55px)` } : { height: `calc(100vh - 104px)` };

        // If a final is on a Saturday or Sunday, let the calendar start on Saturday
        moment.updateLocale('es-us', {
            week: {
                dow: hasWeekendCourse && this.state.showFinalsSchedule ? 6 : 0,
            },
        });

        return (
            <div
                className={classes.container}
                style={isMobile ? { height: 'calc(100% - 50px)' } : undefined}
                onClick={this.handleClosePopover}
            >
                <CalendarToolbar
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                    toggleDisplayFinalsSchedule={this.toggleDisplayFinalsSchedule}
                    showFinalsSchedule={this.state.showFinalsSchedule}
                    scheduleNames={this.state.scheduleNames}
                />
                <div
                    id="screenshot"
                    style={
                        !this.state.screenshotting
                            ? calStyling
                            : {
                                  height: '100%',
                                  width: '1000px',
                              }
                    }
                >
                    <Popper
                        anchorEl={this.state.anchorEl}
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
                        open={Boolean(this.state.anchorEl)}
                    >
                        <CourseCalendarEvent
                            key={this.state.calendarEventKey}
                            closePopover={this.handleClosePopover}
                            courseInMoreInfo={this.state.courseInMoreInfo as CalendarEvent}
                            currentScheduleIndex={this.state.currentScheduleIndex}
                            scheduleNames={this.state.scheduleNames}
                        />
                    </Popper>
                    <Calendar<CalendarEvent, object>
                        localizer={localizer}
                        toolbar={false}
                        formats={{
                            timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
                                date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, 'h A', culture),
                            dayFormat: 'ddd',
                        }}
                        defaultView={Views.WORK_WEEK}
                        views={[Views.WEEK, Views.WORK_WEEK]}
                        view={hasWeekendCourse ? Views.WEEK : Views.WORK_WEEK}
                        step={15}
                        timeslots={2}
                        defaultDate={new Date(2018, 0, 1)}
                        min={new Date(2018, 0, 1, 7)}
                        max={new Date(2018, 0, 1, 23)}
                        events={events}
                        eventPropGetter={ScheduleCalendar.eventStyleGetter}
                        showMultiDayTimes={false}
                        components={{ event: AntAlmanacEvent(classes) }}
                        onSelectEvent={this.handleEventClick}
                    />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ScheduleCalendar);
