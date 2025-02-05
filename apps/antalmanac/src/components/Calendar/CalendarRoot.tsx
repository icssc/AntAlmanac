import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import { Box } from '@material-ui/core';
import moment from 'moment';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Components, DateLocalizer, momentLocalizer, Views, ViewsProps } from 'react-big-calendar';
import { shallow } from 'zustand/shallow';

import { CalendarEvent, CourseEvent } from './CourseCalendarEvent';

import { CalendarCourseEvent } from '$components/Calendar/CalendarCourseEvent';
import { CalendarCourseEventWrapper } from '$components/Calendar/CalendarCourseEventWrapper';
import { CalendarEventPopover } from '$components/Calendar/CalendarEventPopover';
import { CalendarToolbar } from '$components/Calendar/Toolbar/CalendarToolbar';
import { getDefaultFinalsStartDate, getFinalsStartDateForTerm } from '$lib/termData';
import { useScheduleStore } from '$stores/ScheduleStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useTimeFormatStore } from '$stores/SettingsStore';

const CALENDAR_LOCALIZER: DateLocalizer = momentLocalizer(moment);
const CALENDAR_VIEWS: ViewsProps<CalendarEvent, object> = [Views.WEEK, Views.WORK_WEEK];
const CALENDAR_COMPONENTS: Components<CalendarEvent, object> = {
    event: CalendarCourseEvent,
    eventWrapper: CalendarCourseEventWrapper,
};
const CALENDAR_MAX_DATE = new Date(2018, 0, 1, 23);

export const ScheduleCalendar = memo(() => {
    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const {
        getEventsInCalendar,
        getFinalEventsInCalendar,
        getCurrentScheduleIndex,
        getScheduleNames,
    } = useScheduleStore(
        (state) => ({
            getEventsInCalendar: state.getEventsInCalendar(),
            getFinalEventsInCalendar: state.getFinalEventsInCalendar(),
            getCurrentScheduleIndex: state.getCurrentScheduleIndex(),
            getScheduleNames: state.getScheduleNames(),
        }),
        shallow
    );

    const { isMilitaryTime } = useTimeFormatStore();
    const [hoveredCalendarizedCourses, hoveredCalendarizedFinal] = useHoveredStore(
        (state) => [state.hoveredCalendarizedCourses, state.hoveredCalendarizedFinal],
        shallow
    );

    const getEventsForCalendar = useCallback((): CalendarEvent[] => {
        if (showFinalsSchedule)
            return hoveredCalendarizedFinal
                ? [...getFinalEventsInCalendar, hoveredCalendarizedFinal]
                : getFinalEventsInCalendar;
        else
            return hoveredCalendarizedCourses ? [...getEventsInCalendar, ...hoveredCalendarizedCourses] : getEventsInCalendar;
    }, [
        getEventsInCalendar,
        getFinalEventsInCalendar,
        hoveredCalendarizedCourses,
        hoveredCalendarizedFinal,
        showFinalsSchedule,
    ]);

    const events = getEventsForCalendar();

    const toggleDisplayFinalsSchedule = useCallback(() => {
        setShowFinalsSchedule((prevState) => !prevState);
    }, []);

    /**
     * Finds the earliest start time and returns that or 7AM, whichever is earlier
     * @returns A date with the earliest time or 7AM
     */
    const getStartTime = useCallback(() => {
        const eventStartHours = events.map((event) => event.start.getHours());
        return new Date(2018, 0, 1, Math.min(7, Math.min(...eventStartHours)));
    }, [events]);

    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const style = {
            backgroundColor: event.color,
            cursor: 'pointer',
            borderStyle: 'none',
            borderRadius: '4px',
            color: colorContrastSufficient(event.color) ? 'white' : 'black',
        };

        return { style };
    }, []);

    const colorContrastSufficient = (bg: string) => {
        // This equation is taken from w3c, does not use the colour difference part
        const minBrightnessDiff = 125;

        const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
            bg.slice(0, 7)
        ) as RegExpExecArray; // returns {hex, r, g, b}
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

    const hasWeekendCourse = events.some((event) => event.start.getDay() === 0 || event.start.getDay() === 6);

    const calendarTimeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm A';
    const calendarGutterTimeFormat = isMilitaryTime ? 'HH:mm' : 'h A';

    const onlyCourseEvents = getEventsInCalendar.filter((e) => !e.isCustomEvent) as CourseEvent[];

    const finalsDate = hoveredCalendarizedFinal
        ? getFinalsStartDateForTerm(hoveredCalendarizedFinal.term)
        : onlyCourseEvents.length > 0
        ? getFinalsStartDateForTerm(onlyCourseEvents[0].term)
        : getDefaultFinalsStartDate();

    const finalsDateFormat = finalsDate ? 'ddd MM/DD' : 'ddd';
    const date = showFinalsSchedule && finalsDate ? finalsDate : new Date(2018, 0, 1);

    const formats = useMemo(
        () => ({
            timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
                date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, calendarGutterTimeFormat, culture),
            dayFormat: showFinalsSchedule ? finalsDateFormat : 'ddd',
            eventTimeRangeFormat: (range: { start: Date; end: Date }, culture?: string, localizer?: DateLocalizer) =>
                localizer
                    ? `${localizer.format(range.start, calendarTimeFormat, culture)} - ${localizer.format(
                          range.end,
                          calendarTimeFormat,
                          culture
                      )}`
                    : '',
        }),
        [calendarGutterTimeFormat, calendarTimeFormat, finalsDateFormat, showFinalsSchedule]
    );

    useEffect(() => {
        /**
         * If a final is on a Saturday or Sunday, let the calendar start on Saturday
         */
        // eslint-disable-next-line import/no-named-as-default-member -- moment doesn't expose named exports: https://github.com/vitejs/vite-plugin-react/issues/202
        moment.updateLocale('es-us', {
            week: {
                dow: hasWeekendCourse && showFinalsSchedule ? 6 : 0,
            },
        });
    }, [hasWeekendCourse, showFinalsSchedule]);

    return (
        <Box id="calendar-root" borderRadius={1} flexGrow={1} height={'0px'} display="flex" flexDirection="column">
            <CalendarToolbar
                currentScheduleIndex={getCurrentScheduleIndex}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
                showFinalsSchedule={showFinalsSchedule}
                scheduleNames={getScheduleNames}
            />

            <Box id="screenshot" height="0" flexGrow={1}>
                <CalendarEventPopover />

                <Calendar<CalendarEvent, object>
                    localizer={CALENDAR_LOCALIZER}
                    toolbar={false}
                    formats={formats}
                    views={CALENDAR_VIEWS}
                    defaultView={Views.WORK_WEEK}
                    view={hasWeekendCourse ? Views.WEEK : Views.WORK_WEEK}
                    onView={() => {
                        return;
                    }}
                    step={15}
                    timeslots={2}
                    date={date}
                    onNavigate={() => {
                        return;
                    }}
                    min={getStartTime()}
                    max={CALENDAR_MAX_DATE}
                    events={events}
                    eventPropGetter={eventStyleGetter}
                    showMultiDayTimes={false}
                    components={CALENDAR_COMPONENTS}
                />
            </Box>
        </Box>
    );
});

ScheduleCalendar.displayName = 'ScheduleCalendar';
