import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import { Box, ClickAwayListener, Popper } from '@material-ui/core';
import moment from 'moment';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Calendar, DateLocalizer, momentLocalizer, Views } from 'react-big-calendar';

import CalendarToolbar from './CalendarToolbar';
import CourseCalendarEvent, { CalendarEvent } from './CourseCalendarEvent';
import AppStore from '$stores/AppStore';
import buildingCatalogue from '$lib/buildingCatalogue';
import { useTimeFormatStore } from '$stores/TimeStore';

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
    ({ classes }: { classes: ClassNameMap }) =>
    // eslint-disable-next-line react/display-name
    ({ event }: { event: CalendarEvent }) => {
        return event.isCustomEvent ? (
            <div className={classes.customEventContainer}>
                <div className={classes.customEventTitle}>{event.title}</div>
                <div className={classes.secondLineContainer}>
                    {event.building ? buildingCatalogue[+event.building].name : ''}
                </div>
            </div>
        ) : (
            <div>
                <div className={classes.firstLineContainer}>
                    <div> {event.title}</div>
                    <div className={classes.sectionType}> {event.sectionType}</div>
                </div>
                <div className={classes.secondLineContainer}>
                    <div>
                        {event.showLocationInfo
                            ? event.locations.map((location) => `${location.building} ${location.room}`).join(', ')
                            : event.locations.length > 1
                            ? `${event.locations.length} Locations`
                            : `${event.locations[0].building} ${event.locations[0].room}`}
                    </div>
                    <div>{event.sectionCode}</div>
                </div>
            </div>
        );
    };
interface ScheduleCalendarProps {
    isMobile: boolean;
}

export default function ScheduleCalendar(props: ScheduleCalendarProps) {
    const { isMobile } = props;

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const [courseInMoreInfo, setCourseInMoreInfo] = useState<CalendarEvent | null>(null);
    const [calendarEventKey, setCalendarEventKey] = useState<number | null>(null);
    const [eventsInCalendar, setEventsInCalendar] = useState(AppStore.getEventsInCalendar());
    const [finalsEventsInCalendar, setFinalEventsInCalendar] = useState(AppStore.getFinalEventsInCalendar());
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const { isMilitaryTime } = useTimeFormatStore();

    const getEventsForCalendar = () => {
        return showFinalsSchedule ? finalsEventsInCalendar : eventsInCalendar;
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const toggleDisplayFinalsSchedule = () => {
        handleClosePopover();

        setShowFinalsSchedule((prevState) => !prevState);
    };

    const handleEventClick = (event: CalendarEvent, e: SyntheticEvent<HTMLElement, Event>) => {
        const { currentTarget } = e;
        e.stopPropagation();

        if (event.isCustomEvent || event.sectionType !== 'Fin') {
            setAnchorEl((prevAnchorEl) => (prevAnchorEl === currentTarget ? null : currentTarget));
            setCourseInMoreInfo(event);
            setCalendarEventKey(Math.random());
        }
    };

    /**
     * Finds the earliest start time and returns that or 7AM, whichever is earlier
     * @returns A date with the earliest time or 7AM
     */
    const getStartTime = () => {
        const eventStartHours = getEventsForCalendar().map((event) => event.start.getHours());
        return new Date(2018, 0, 1, Math.min(7, Math.min(...eventStartHours)));
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        return {
            style: {
                backgroundColor: event.color,
                cursor: 'pointer',
                borderStyle: 'none',
                borderRadius: '4px',
                color: colorContrastSufficient(event.color) ? 'white' : 'black',
            },
        };
    };

    const colorContrastSufficient = (bg: string) => {
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

    const events = getEventsForCalendar();
    const hasWeekendCourse = events.some((event) => event.start.getDay() === 0 || event.start.getDay() === 6);
    const calendarStyling = isMobile ? { height: `calc(100% - 55px)` } : { height: `calc(100vh - 104px)` };
    const calendarTimeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm A';
    const calendarGutterTimeFormat = isMilitaryTime ? 'HH:mm' : 'h A';

    // If a final is on a Saturday or Sunday, let the calendar start on Saturday
    moment.updateLocale('es-us', {
        week: {
            dow: hasWeekendCourse && showFinalsSchedule ? 6 : 0,
        },
    });

    useEffect(() => {
        const updateEventsInCalendar = () => {
            setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
            setEventsInCalendar(AppStore.getEventsInCalendar());
            setFinalEventsInCalendar(AppStore.getFinalEventsInCalendar());

            handleClosePopover();
        };

        const updateScheduleNames = () => {
            setScheduleNames(AppStore.getScheduleNames());
        };

        AppStore.on('addedCoursesChange', updateEventsInCalendar);
        AppStore.on('customEventsChange', updateEventsInCalendar);
        AppStore.on('colorChange', updateEventsInCalendar);
        AppStore.on('currentScheduleIndexChange', updateEventsInCalendar);
        AppStore.on('scheduleNamesChange', updateScheduleNames);

        return () => {
            AppStore.off('addedCoursesChange', updateEventsInCalendar);
            AppStore.off('customEventsChange', updateEventsInCalendar);
            AppStore.off('colorChange', updateEventsInCalendar);
            AppStore.off('currentScheduleIndexChange', updateEventsInCalendar);
            AppStore.off('scheduleNamesChange', updateScheduleNames);
        };
    }, []);

    return (
        <Box
            style={{
                height: isMobile ? 'calc(100% - 50px)' : undefined,
                margin: '0px 4px',
                borderRadius: '1px',
            }}
        >
            <CalendarToolbar
                currentScheduleIndex={currentScheduleIndex}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
                showFinalsSchedule={showFinalsSchedule}
                scheduleNames={scheduleNames}
            />
            <Box id="screenshot" style={calendarStyling}>
                <Popper
                    anchorEl={anchorEl}
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
                    open={Boolean(anchorEl)}
                >
                    <ClickAwayListener onClickAway={handleClosePopover}>
                        <Box>
                            <CourseCalendarEvent
                                key={calendarEventKey}
                                closePopover={handleClosePopover}
                                courseInMoreInfo={courseInMoreInfo as CalendarEvent}
                                scheduleNames={scheduleNames}
                            />
                        </Box>
                    </ClickAwayListener>
                </Popper>
                <Calendar<CalendarEvent, object>
                    localizer={localizer}
                    toolbar={false}
                    formats={{
                        timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
                            date.getMinutes() > 0 || !localizer
                                ? ''
                                : localizer.format(date, calendarGutterTimeFormat, culture),
                        dayFormat: 'ddd',
                        eventTimeRangeFormat: (
                            range: { start: Date; end: Date },
                            culture?: string,
                            localizer?: DateLocalizer
                        ) =>
                            !localizer
                                ? ''
                                : localizer.format(range.start, calendarTimeFormat, culture) +
                                  ' - ' +
                                  localizer.format(range.end, calendarTimeFormat, culture),
                    }}
                    views={[Views.WEEK, Views.WORK_WEEK]}
                    defaultView={Views.WORK_WEEK}
                    view={hasWeekendCourse ? Views.WEEK : Views.WORK_WEEK}
                    step={15}
                    timeslots={2}
                    defaultDate={new Date(2018, 0, 1)}
                    min={getStartTime()}
                    max={new Date(2018, 0, 1, 23)}
                    events={events}
                    eventPropGetter={eventStyleGetter}
                    showMultiDayTimes={false}
                    components={{ event: AntAlmanacEvent }}
                    onSelectEvent={handleEventClick}
                />
            </Box>
        </Box>
    );
}
