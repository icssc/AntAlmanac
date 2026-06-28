'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { CalendarEventPopover } from '$components/Calendar/CalendarEvent/CalendarEventPopover';
import { CalendarEventTile } from '$components/Calendar/CalendarEvent/CalendarEventTile';
import { CalendarEventWrapper } from '$components/Calendar/CalendarEvent/CalendarEventWrapper';
import { CALENDAR_BASE_DATE, createSkeletonEvents } from '$components/Calendar/Skeleton/skeletonHelpers';
import { TbaCalendarCard } from '$components/Calendar/TbaCalendarCard';
import { CalendarToolbar } from '$components/Calendar/Toolbar/CalendarToolbar';
import { type CalendarEvent, type SkeletonEvent, isCourseEvent, isSkeletonEvent } from '$components/Calendar/types';
import { EmptyState } from '$components/EmptyState';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSectionThemeAssignments } from '$hooks/useSectionThemeAssignments';
import { removeLocalStorageSkeletonBlueprint, setLocalStorageSkeletonBlueprint } from '$lib/localStorage';
import { applyThemeToCalendarEvents } from '$lib/sectionThemes';
import { TAB_HREF } from '$lib/tabs/tabs';
import { getDefaultTerm } from '$lib/term';
import AppStore from '$stores/AppStore';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { scheduleSectionKey } from '$stores/scheduleHelpers';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { CalendarMonth } from '@mui/icons-material';
import { Backdrop, Box, useTheme } from '@mui/material';
import { VisibilityState } from '@packages/antalmanac-types';
import { type Locale, differenceInCalendarDays, format, getDay, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, type Components, DateLocalizer, Views, type ViewsProps, dateFnsLocalizer } from 'react-big-calendar';
import { useShallow } from 'zustand/react/shallow';

/*
 * Start week on Sunday so Saturday appears after Friday.
 * This ensures the standard week layout: Su, M, Tu, W, Th, F, Sa
 * Normal schedules: Su ... Sa (Sa rightmost)
 *
 * Finals locale: week starts Saturday (Sa ... Fr)
 */
const enUSSunday: Locale = { ...enUS, options: { ...enUS.options, weekStartsOn: 0 } };
const enUSFinals: Locale = { ...enUS, options: { ...enUS.options, weekStartsOn: 6 } };

const locales: Record<string, Locale> = {
    'en-us': enUSSunday,
    'en-us-finals': enUSFinals,
};
const CALENDAR_VIEWS: ViewsProps<CalendarEvent, object> = [Views.WEEK, Views.WORK_WEEK];
const CALENDAR_COMPONENTS: Components<CalendarEvent, object> = {
    event: CalendarEventTile,
    eventWrapper: CalendarEventWrapper,
};
const CALENDAR_MAX_DATE = new Date(2018, 0, 1, 23);
const noop = () => {};

export const ScheduleCalendar = memo(() => {
    const router = useRouter();
    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const [currentScheduleCourses, setCurrentScheduleCourses] = useState(() => AppStore.schedule.getCurrentCourses());
    const [currentScheduleCustomEvents, setCurrentScheduleCustomEvents] = useState(() =>
        AppStore.schedule.getCurrentCustomEvents()
    );
    const [rawEventsInCalendar, setEventsInCalendar] = useState(() => AppStore.getEventsInCalendar());
    const [rawFinalsEventsInCalendar, setFinalEventsInCalendar] = useState(() => AppStore.getFinalEventsInCalendar());
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());
    const [currentScheduleId, setCurrentScheduleId] = useState(() => AppStore.getCurrentScheduleId());
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());

    const theme = useTheme();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);
    const [hoveredCalendarizedCourses, hoveredCalendarizedFinal] = useHoveredStore(
        useShallow((state) => [state.hoveredCalendarizedCourses, state.hoveredCalendarizedFinal])
    );
    const { setting, palette, assignments } = useSectionThemeAssignments();

    const eventsInCalendar = useMemo(
        () => applyThemeToCalendarEvents(rawEventsInCalendar, setting, assignments, palette),
        [rawEventsInCalendar, setting, assignments, palette]
    );
    const finalsEventsInCalendar = useMemo(
        () => applyThemeToCalendarEvents(rawFinalsEventsInCalendar, setting, assignments, palette),
        [rawFinalsEventsInCalendar, setting, assignments, palette]
    );
    const visibilityMap = useHiddenCoursesStore((state) => state.visibilityMap);

    const openLoadingSchedule = useScheduleComponentsToggleStore((state) => state.openLoadingSchedule);
    const hasHadEventsRef = useRef(false);

    const isMobile = useIsMobile();

    const onlyCourseEvents = useMemo(() => eventsInCalendar.filter(isCourseEvent), [eventsInCalendar]);

    const getEventsForCalendar = useCallback((): CalendarEvent[] => {
        const raw = showFinalsSchedule
            ? hoveredCalendarizedFinal
                ? [...finalsEventsInCalendar, hoveredCalendarizedFinal]
                : finalsEventsInCalendar
            : hoveredCalendarizedCourses
              ? [...eventsInCalendar, ...hoveredCalendarizedCourses]
              : eventsInCalendar;

        return raw.filter((e) => {
            if (!isCourseEvent(e)) return true;
            const visibility: VisibilityState =
                visibilityMap[currentScheduleId]?.[scheduleSectionKey(e.term, e.sectionCode)] ??
                VisibilityState.Visible;
            return visibility !== VisibilityState.Disappeared;
        });
    }, [
        eventsInCalendar,
        finalsEventsInCalendar,
        hoveredCalendarizedCourses,
        hoveredCalendarizedFinal,
        showFinalsSchedule,
        currentScheduleId,
        visibilityMap,
    ]);

    useEffect(() => {
        if (!openLoadingSchedule) {
            if (eventsInCalendar.length > 0) {
                hasHadEventsRef.current = true;
                const skeletonBlueprint = eventsInCalendar
                    .map((event) => {
                        const dayOffset = differenceInCalendarDays(event.start, CALENDAR_BASE_DATE);
                        return {
                            dayOffset,
                            startHour: event.start.getHours(),
                            startMinute: event.start.getMinutes(),
                            endHour: event.end.getHours(),
                            endMinute: event.end.getMinutes(),
                        };
                    })
                    .filter((blueprint) => blueprint.dayOffset >= -1 && blueprint.dayOffset <= 5);

                if (skeletonBlueprint.length > 0) {
                    setLocalStorageSkeletonBlueprint(JSON.stringify(skeletonBlueprint));
                }
            } else if (hasHadEventsRef.current) {
                removeLocalStorageSkeletonBlueprint();
                hasHadEventsRef.current = false;
            }
        }
    }, [eventsInCalendar, openLoadingSchedule]);

    const skeletonColor = theme.vars.palette.action.disabledBackground;

    const events = useMemo(
        () => (openLoadingSchedule ? createSkeletonEvents(skeletonColor) : getEventsForCalendar()),
        [openLoadingSchedule, getEventsForCalendar, skeletonColor]
    );

    const toggleDisplayFinalsSchedule = useCallback(() => {
        setShowFinalsSchedule((prevState) => !prevState);
    }, []);

    /**
     * Finds the earliest start time and returns that or 7AM, whichever is earlier
     */
    const startTime = useMemo(() => {
        const validHours = events.map((event) => event.start.getHours()).filter(Number.isFinite);
        return new Date(2018, 0, 1, Math.min(7, ...validHours, 7));
    }, [events]);

    const eventStyleGetter = useCallback(
        (event: CalendarEvent | SkeletonEvent) => {
            const visibility: VisibilityState = isCourseEvent(event)
                ? (visibilityMap[currentScheduleId]?.[scheduleSectionKey(event.term, event.sectionCode)] ??
                  VisibilityState.Visible)
                : VisibilityState.Visible;

            const style =
                visibility === VisibilityState.Outlined
                    ? {
                          backgroundColor: theme.vars.palette.background.default,
                          border: `2px solid ${event.color}`,
                          borderRadius: '4px',
                          color: event.color,
                          cursor: 'pointer',
                      }
                    : {
                          backgroundColor: event.color,
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          borderRadius: '4px',
                          // Skeleton text is empty so contrast doesn't matter — skip the check.
                          color: isSkeletonEvent(event)
                              ? 'transparent'
                              : colorContrastSufficient(event.color)
                                ? 'white'
                                : 'black',
                      };

            return isSkeletonEvent(event) ? { style, className: 'calendar-loading-event' } : { style };
        },
        [currentScheduleId, theme, visibilityMap]
    );

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

    const showEmptyState = useMemo(
        () =>
            !openLoadingSchedule &&
            !hoveredCalendarizedCourses &&
            !hoveredCalendarizedFinal &&
            currentScheduleCourses.length === 0 &&
            currentScheduleCustomEvents.length === 0,
        [
            openLoadingSchedule,
            hoveredCalendarizedCourses,
            hoveredCalendarizedFinal,
            currentScheduleCourses.length,
            currentScheduleCustomEvents.length,
        ]
    );

    const hasWeekendCourse = events.some((event) => event.start.getDay() === 0 || event.start.getDay() === 6);
    const calendarTimeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm a';
    const calendarGutterTimeFormat = isMilitaryTime ? 'HH:mm' : 'h a';

    const finalsTerm = hoveredCalendarizedFinal?.term ?? onlyCourseEvents[0]?.term;
    const finalsDate = (finalsTerm ?? getDefaultTerm()).finalsStart;

    const finalsStartsOnSaturday = showFinalsSchedule && finalsDate.getDay() === 6;

    const culture = finalsStartsOnSaturday ? 'en-us-finals' : 'en-us';

    const calendarLocalizer = useMemo(() => dateFnsLocalizer({ format, getDay, startOfWeek, locales }), []);

    // Check if there are any finals on weekends (else only display M-F)
    const hasWeekendFinals =
        showFinalsSchedule &&
        [...finalsEventsInCalendar, hoveredCalendarizedFinal]
            .filter(Boolean)
            .some((event) => event != null && [0, 6].includes(event.start.getDay()));

    const shouldShowWeekView = showFinalsSchedule ? hasWeekendFinals : hasWeekendCourse;
    const calendarView = shouldShowWeekView ? Views.WEEK : Views.WORK_WEEK;

    const finalsDateFormat = isMobile ? 'M/dd' : 'eee M/dd';
    const date = showFinalsSchedule ? finalsDate : new Date(2018, 0, 1);

    const formats = useMemo(
        () => ({
            timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
                date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, calendarGutterTimeFormat, culture),
            dayFormat: showFinalsSchedule ? finalsDateFormat : 'eee',
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
        const updateEventsInCalendar = () => {
            setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
            setCurrentScheduleId(AppStore.getCurrentScheduleId());
            setEventsInCalendar(AppStore.getEventsInCalendar());
            setFinalEventsInCalendar(AppStore.getFinalEventsInCalendar());
            setCurrentScheduleCourses(AppStore.schedule.getCurrentCourses());
            setCurrentScheduleCustomEvents(AppStore.schedule.getCurrentCustomEvents());
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
            id="calendar-root"
            borderRadius={1}
            flexGrow={1}
            height={'0px'}
            display="flex"
            flexDirection="column"
            position="relative"
        >
            <Backdrop
                sx={(theme) => ({
                    color: '#ffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    zIndex: theme.zIndex.drawer + 1,
                    position: 'absolute',
                    padding: 0,
                })}
                open={openLoadingSchedule}
            />

            <CalendarToolbar
                currentScheduleIndex={currentScheduleIndex}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
                showFinalsSchedule={showFinalsSchedule}
                scheduleNames={scheduleNames}
            />

            <Box
                id="screenshot"
                height="0"
                flexGrow={1}
                position="relative"
                sx={(theme) => ({
                    // Override react-big-calendar's .rbc-today light-blue bg in dark mode
                    '& .rbc-today': {
                        ...theme.applyStyles('dark', {
                            backgroundColor: theme.vars.palette.background.paper,
                        }),
                    },
                })}
            >
                <TbaCalendarCard />
                <CalendarEventPopover scheduleNames={scheduleNames} />

                <Backdrop
                    open={showEmptyState}
                    data-html2canvas-ignore
                    sx={(theme) => ({
                        color: '#ffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        zIndex: theme.zIndex.drawer + 1,
                        position: 'absolute',
                        padding: 0,
                    })}
                >
                    <EmptyState
                        Icon={CalendarMonth}
                        title="Your schedule is empty"
                        description="Search for courses to start building your schedule."
                        primaryAction={{
                            label: 'Search for Courses',
                            onClick: () => router.push(TAB_HREF.search),
                        }}
                    />
                </Backdrop>

                <Calendar<CalendarEvent, object>
                    localizer={calendarLocalizer}
                    culture={culture}
                    toolbar={false}
                    formats={formats}
                    views={CALENDAR_VIEWS}
                    defaultView={Views.WORK_WEEK}
                    view={calendarView}
                    onView={noop}
                    step={30}
                    timeslots={1}
                    date={date}
                    onNavigate={noop}
                    min={startTime}
                    max={CALENDAR_MAX_DATE}
                    scrollToTime={startTime}
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
