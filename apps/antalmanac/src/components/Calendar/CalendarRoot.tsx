'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { CalendarCourseEvent } from '$components/Calendar/CalendarCourseEvent';
import { CalendarCourseEventWrapper } from '$components/Calendar/CalendarCourseEventWrapper';
import { CalendarEventPopover } from '$components/Calendar/CalendarEventPopover';
import type { CalendarEvent, CourseEvent, SkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import { skeletonBlueprintVariations } from '$components/Calendar/skeletonBlueprintVariations';
import { TbaCalendarCard } from '$components/Calendar/TbaCalendarCard';
import { CalendarToolbar } from '$components/Calendar/Toolbar/CalendarToolbar';
import { EmptyState } from '$components/EmptyState';
import { useIsMobile } from '$hooks/useIsMobile';
import {
    getLocalStorageSkeletonBlueprint,
    removeLocalStorageSkeletonBlueprint,
    setLocalStorageSkeletonBlueprint,
} from '$lib/localStorage';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import { getDefaultTerm } from '$lib/term';
import { useHiddenCoursesStore, VisibilityState } from '$stores/HiddenCoursesStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import { useThemeStore, useTimeFormatStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';
import { CalendarMonth } from '@mui/icons-material';
import { Box, Backdrop, useTheme } from '@mui/material';
import { differenceInCalendarDays, format, getDay, startOfWeek, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Components, DateLocalizer, dateFnsLocalizer, Views, ViewsProps } from 'react-big-calendar';
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
    event: CalendarCourseEvent,
    eventWrapper: CalendarCourseEventWrapper,
};
const BASE_DATE = new Date(2018, 0, 1);
const CALENDAR_MAX_DATE = new Date(2018, 0, 1, 23);

interface SkeletonBlueprint {
    dayOffset: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
}

function blueprintToSkeletonEvent(blueprint: SkeletonBlueprint, color: string): SkeletonEvent {
    const start = new Date(BASE_DATE);
    start.setDate(start.getDate() + blueprint.dayOffset);
    start.setHours(blueprint.startHour, blueprint.startMinute, 0, 0);

    const end = new Date(start);
    end.setHours(blueprint.endHour, blueprint.endMinute, 0, 0);

    return {
        color,
        start,
        end,
        title: '',
        isSkeletonEvent: true,
    } as SkeletonEvent;
}

function createSkeletonEvents(color: string): SkeletonEvent[] {
    const savedDataString = getLocalStorageSkeletonBlueprint();

    let skeletonBlueprints: SkeletonBlueprint[] | null = null;

    if (savedDataString) {
        const parsedData = JSON.parse(savedDataString);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
            skeletonBlueprints = parsedData;
        }
    }

    if (skeletonBlueprints) {
        return skeletonBlueprints.map((b) => blueprintToSkeletonEvent(b, color));
    }

    const randomIndex = Math.floor(Math.random() * skeletonBlueprintVariations.length);
    const fallbackBlueprints = skeletonBlueprintVariations[randomIndex];

    return fallbackBlueprints.map((b) => blueprintToSkeletonEvent(b, color));
}

export const ScheduleCalendar = memo(() => {
    const scheduleSource = useScheduleViewSource();

    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const [currentScheduleCourses, setCurrentScheduleCourses] = useState(() =>
        scheduleSource.schedule.getCurrentCourses()
    );
    const [currentScheduleCustomEvents, setCurrentScheduleCustomEvents] = useState(() =>
        scheduleSource.schedule.getCurrentCustomEvents()
    );
    const [eventsInCalendar, setEventsInCalendar] = useState(() => scheduleSource.getEventsInCalendar());
    const [finalsEventsInCalendar, setFinalEventsInCalendar] = useState(() =>
        scheduleSource.getFinalEventsInCalendar()
    );
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => scheduleSource.getCurrentScheduleIndex());
    const [currentScheduleId, setCurrentScheduleId] = useState(() => scheduleSource.getCurrentScheduleId());
    const [scheduleNames, setScheduleNames] = useState(() => scheduleSource.getScheduleNames());

    const theme = useTheme();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);
    const [hoveredCalendarizedCourses, hoveredCalendarizedFinal] = useHoveredStore(
        useShallow((state) => [state.hoveredCalendarizedCourses, state.hoveredCalendarizedFinal])
    );
    const isDark = useThemeStore((store) => store.isDark);
    const visibilityMap = useHiddenCoursesStore((state) => state.visibilityMap);
    const selectedEvent = useSelectedEventStore((state) => state.selectedEvent);

    const openLoadingSchedule = useScheduleComponentsToggleStore((state) => state.openLoadingSchedule);
    const hasHadEventsRef = useRef(false);

    const isMobile = useIsMobile();

    const onlyCourseEvents = useMemo(
        () => eventsInCalendar.filter((e) => !e.isCustomEvent) as CourseEvent[],
        [eventsInCalendar]
    );

    const getEventsForCalendar = useCallback((): CalendarEvent[] => {
        const raw = showFinalsSchedule
            ? hoveredCalendarizedFinal
                ? [...finalsEventsInCalendar, hoveredCalendarizedFinal]
                : finalsEventsInCalendar
            : hoveredCalendarizedCourses
              ? [...eventsInCalendar, ...hoveredCalendarizedCourses]
              : eventsInCalendar;

        return raw.filter((e) => {
            if ('isCustomEvent' in e && e.isCustomEvent) return true;
            if ('isSkeletonEvent' in e && e.isSkeletonEvent) return true;
            if (!scheduleSource.appliesCourseVisibility) {
                return true;
            }
            const visibility: VisibilityState =
                visibilityMap[currentScheduleId]?.[(e as CourseEvent).sectionCode] ?? VisibilityState.Visible;
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
        scheduleSource.appliesCourseVisibility,
    ]);

    useEffect(() => {
        if (!openLoadingSchedule) {
            if (eventsInCalendar.length > 0) {
                hasHadEventsRef.current = true;
                const skeletonBlueprint = eventsInCalendar
                    .map((event) => {
                        const dayOffset = differenceInCalendarDays(event.start, BASE_DATE);
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

    const skeletonColor = theme.palette.action.disabledBackground;

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
            const isSkeletonEvent = 'isSkeletonEvent' in event && event.isSkeletonEvent;

            const visibility: VisibilityState =
                !isSkeletonEvent && !('isCustomEvent' in event && event.isCustomEvent)
                    ? (visibilityMap[currentScheduleId]?.[(event as CourseEvent).sectionCode] ??
                      VisibilityState.Visible)
                    : VisibilityState.Visible;

            const isSelected = event === selectedEvent;

            const style =
                visibility === VisibilityState.Outlined
                    ? {
                          backgroundColor: theme.palette.background.default,
                          border: `2px solid ${event.color}`,
                          borderRadius: '4px',
                          color: event.color,
                          cursor: 'pointer',
                          ...(isSelected && { zIndex: 10 }),
                      }
                    : {
                          backgroundColor: event.color,
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          borderRadius: '4px',
                          // Skeleton text is empty so contrast doesn't matter — skip the check.
                          color: isSkeletonEvent
                              ? 'transparent'
                              : colorContrastSufficient(event.color)
                                ? 'white'
                                : 'black',
                          ...(isSelected && { zIndex: 10 }),
                      };

            return isSkeletonEvent ? { style, className: 'calendar-loading-event' } : { style };
        },
        [currentScheduleId, selectedEvent, theme, visibilityMap]
    );

    /**
     * This prop getter overrides `react-big-calendar`'s built-in `.rbc-today` style which applies a light blue coloring on both light and dark mode.
     */
    const dayStyleGetter = useCallback(
        (date: Date) => {
            if (date.toLocaleDateString() !== new Date().toLocaleDateString()) {
                return {};
            }

            const style = {
                backgroundColor: isDark ? theme.palette.background.paper : '',
            };

            return { style };
        },
        [isDark, theme]
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
        const syncFromSource = () => {
            setCurrentScheduleIndex(scheduleSource.getCurrentScheduleIndex());
            setCurrentScheduleId(scheduleSource.getCurrentScheduleId());
            setEventsInCalendar(scheduleSource.getEventsInCalendar());
            setFinalEventsInCalendar(scheduleSource.getFinalEventsInCalendar());
            setCurrentScheduleCourses(scheduleSource.schedule.getCurrentCourses());
            setCurrentScheduleCustomEvents(scheduleSource.schedule.getCurrentCustomEvents());
            setScheduleNames(scheduleSource.getScheduleNames());
        };

        syncFromSource();
        return scheduleSource.subscribe(syncFromSource);
    }, [scheduleSource]);

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

            <Box id="screenshot" height="0" flexGrow={1} position="relative">
                <TbaCalendarCard />
                <CalendarEventPopover />

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
                            onClick: () => useTabStore.getState().setActiveTab('search'),
                        }}
                    />
                </Backdrop>

                <Calendar<CalendarEvent, object>
                    key={`${culture}-${calendarView}`}
                    localizer={calendarLocalizer}
                    culture={culture}
                    toolbar={false}
                    formats={formats}
                    views={CALENDAR_VIEWS}
                    defaultView={Views.WORK_WEEK}
                    view={calendarView}
                    onView={() => {
                        return;
                    }}
                    step={15}
                    timeslots={2}
                    date={date}
                    onNavigate={() => {
                        return;
                    }}
                    min={startTime}
                    max={CALENDAR_MAX_DATE}
                    scrollToTime={startTime}
                    events={events}
                    eventPropGetter={eventStyleGetter}
                    dayPropGetter={dayStyleGetter}
                    showMultiDayTimes={false}
                    components={CALENDAR_COMPONENTS}
                />
            </Box>
        </Box>
    );
});

ScheduleCalendar.displayName = 'ScheduleCalendar';
