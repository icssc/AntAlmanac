"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { CalendarCourseEvent } from "$components/Calendar/CalendarCourseEvent";
import { CalendarCourseEventWrapper } from "$components/Calendar/CalendarCourseEventWrapper";
import { CalendarEventPopover } from "$components/Calendar/CalendarEventPopover";
import type {
    CalendarEvent,
    CourseEvent,
    SkeletonEvent,
} from "$components/Calendar/CourseCalendarEvent";
import { skeletonBlueprintVariations } from "$components/Calendar/skeletonBlueprintVariations";
import { CalendarToolbar } from "$components/Calendar/Toolbar/CalendarToolbar";
import { useIsMobile } from "$hooks/useIsMobile";
import {
    getLocalStorageSkeletonBlueprint,
    removeLocalStorageSkeletonBlueprint,
    setLocalStorageSkeletonBlueprint,
} from "$lib/localStorage";
import { getDefaultFinalsStartDate, getFinalsStartDateForTerm } from "$lib/termData";
import AppStore from "$stores/AppStore";
import { useHoveredStore } from "$stores/HoveredStore";
import { scheduleComponentsToggleStore } from "$stores/ScheduleComponentsToggleStore";
import { useThemeStore, useTimeFormatStore } from "$stores/SettingsStore";
import { Backdrop, Box, useTheme } from "@mui/material";
import moment from "moment";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Calendar,
    Components,
    DateLocalizer,
    Views,
    ViewsProps,
    momentLocalizer,
} from "react-big-calendar";
import { useShallow } from "zustand/react/shallow";
import { shallow } from "zustand/shallow";

/*
//  * Always start week on Saturday for finals potentially on weekends.
//  * CALENDAR_VIEWS will set the correct day range
 * Start week on Sunday so Saturday appears after Friday.
 * This ensures the standard week layout: Su, M, Tu, W, Th, F, Sa
 * Normal schedules: Su ... Sa (Sa rightmost)
 */
// eslint-disable-next-line import/no-named-as-default-member
moment.defineLocale("en-us", {
    parentLocale: "en",
    week: {
        dow: 0, // Sunday = 0, Monday = 1, ..., Saturday = 6
    },
});

// Finals locale: week starts Saturday (Sa ... Fr)
// eslint-disable-next-line import/no-named-as-default-member
moment.defineLocale("en-us-finals", {
    parentLocale: "en-us",
    week: { dow: 6 },
});

// eslint-disable-next-line import/no-named-as-default-member
moment.locale("en-us");
const CALENDAR_VIEWS: ViewsProps<CalendarEvent, object> = [Views.WEEK, Views.WORK_WEEK];
const CALENDAR_COMPONENTS: Components<CalendarEvent, object> = {
    event: CalendarCourseEvent,
    eventWrapper: CalendarCourseEventWrapper,
};
const BASE_DATE = new Date(2018, 0, 1);
const CALENDAR_MAX_DATE = new Date(2018, 0, 1, 23);

export const ScheduleCalendar = memo(() => {
    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const [eventsInCalendar, setEventsInCalendar] = useState(() => AppStore.getEventsInCalendar());
    const [finalsEventsInCalendar, setFinalEventsInCalendar] = useState(() =>
        AppStore.getFinalEventsInCalendar(),
    );
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() =>
        AppStore.getCurrentScheduleIndex(),
    );
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());

    const theme = useTheme();
    const { isMilitaryTime } = useTimeFormatStore();
    const [hoveredCalendarizedCourses, hoveredCalendarizedFinal] = useHoveredStore(
        (state) => [state.hoveredCalendarizedCourses, state.hoveredCalendarizedFinal],
        shallow,
    );
    const isDark = useThemeStore(useShallow((store) => store.isDark));

    const { openLoadingSchedule: loadingSchedule } = scheduleComponentsToggleStore();
    const hasHadEventsRef = useRef(false);

    const isMobile = useIsMobile();

    const onlyCourseEvents = useMemo(
        () => eventsInCalendar.filter((e) => !e.isCustomEvent) as CourseEvent[],
        [eventsInCalendar],
    );

    const getEventsForCalendar = useCallback((): CalendarEvent[] => {
        return showFinalsSchedule
            ? hoveredCalendarizedFinal
                ? [...finalsEventsInCalendar, hoveredCalendarizedFinal]
                : finalsEventsInCalendar
            : hoveredCalendarizedCourses
              ? [...eventsInCalendar, ...hoveredCalendarizedCourses]
              : eventsInCalendar;
    }, [
        eventsInCalendar,
        finalsEventsInCalendar,
        hoveredCalendarizedCourses,
        hoveredCalendarizedFinal,
        showFinalsSchedule,
    ]);

    useEffect(() => {
        if (!loadingSchedule) {
            if (eventsInCalendar.length > 0) {
                hasHadEventsRef.current = true;
                const skeletonBlueprint = eventsInCalendar
                    .map((event) => {
                        const dayOffset = event.start.getDate() - BASE_DATE.getDate();
                        return {
                            dayOffset,
                            startHour: event.start.getHours(),
                            startMinute: event.start.getMinutes(),
                            endHour: event.end.getHours(),
                            endMinute: event.end.getMinutes(),
                        };
                    })
                    .filter((blueprint) => blueprint.dayOffset >= 0 && blueprint.dayOffset <= 6);

                if (skeletonBlueprint.length > 0) {
                    setLocalStorageSkeletonBlueprint(JSON.stringify(skeletonBlueprint));
                }
            } else if (hasHadEventsRef.current) {
                removeLocalStorageSkeletonBlueprint();
                hasHadEventsRef.current = false;
            }
        }
    }, [eventsInCalendar, loadingSchedule]);

    const blueprintToSkeletonEvent = useCallback(
        (blueprint: {
            dayOffset: number;
            startHour: number;
            startMinute: number;
            endHour: number;
            endMinute: number;
        }): SkeletonEvent => {
            const start = new Date(BASE_DATE);
            start.setDate(start.getDate() + blueprint.dayOffset);
            start.setHours(blueprint.startHour, blueprint.startMinute, 0, 0);

            const end = new Date(start);
            end.setHours(blueprint.endHour, blueprint.endMinute, 0, 0);

            return {
                color: "#6d6d6d",
                start,
                end,
                title: "",
                isSkeletonEvent: true,
            } as SkeletonEvent;
        },
        [],
    );

    const createSkeletonEvents = useCallback((): SkeletonEvent[] => {
        const savedDataString = getLocalStorageSkeletonBlueprint();

        let skeletonBlueprints: Array<{
            dayOffset: number;
            startHour: number;
            startMinute: number;
            endHour: number;
            endMinute: number;
        }> | null = null;

        if (savedDataString) {
            const parsedData = JSON.parse(savedDataString);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                skeletonBlueprints = parsedData;
            }
        }

        if (skeletonBlueprints) {
            return skeletonBlueprints.map(blueprintToSkeletonEvent);
        }

        const randomIndex = Math.floor(Math.random() * skeletonBlueprintVariations.length);
        const fallbackBlueprints = skeletonBlueprintVariations[randomIndex];

        return fallbackBlueprints.map(blueprintToSkeletonEvent);
    }, [blueprintToSkeletonEvent]);

    const events = loadingSchedule ? createSkeletonEvents() : getEventsForCalendar();

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

    const eventStyleGetter = useCallback((event: CalendarEvent | SkeletonEvent) => {
        const isSkeletonEvent = "isSkeletonEvent" in event && event.isSkeletonEvent;

        const style = {
            backgroundColor: event.color,
            cursor: "pointer",
            borderStyle: "none",
            borderRadius: "4px",
            color: colorContrastSufficient(event.color) ? "white" : "black",
        };

        return isSkeletonEvent ? { style, className: "calendar-loading-event" } : { style };
    }, []);

    /**
     * This prop getter overrides `react-big-calendar`'s built-in `.rbc-today` style which applies a light blue coloring on both light and dark mode.
     */
    const dayStyleGetter = useCallback(
        (date: Date) => {
            if (date.toLocaleDateString() !== new Date().toLocaleDateString()) {
                return {};
            }

            const style = {
                backgroundColor: isDark ? theme.palette.background.paper : "",
            };

            return { style };
        },
        [isDark, theme],
    );

    const colorContrastSufficient = (bg: string) => {
        // This equation is taken from w3c, does not use the colour difference part
        const minBrightnessDiff = 125;

        const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
            bg.slice(0, 7),
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

    const hasWeekendCourse = events.some(
        (event) => event.start.getDay() === 0 || event.start.getDay() === 6,
    );
    const calendarTimeFormat = isMilitaryTime ? "HH:mm" : "h:mm A";
    const calendarGutterTimeFormat = isMilitaryTime ? "HH:mm" : "h A";

    const finalsDate = hoveredCalendarizedFinal
        ? getFinalsStartDateForTerm(hoveredCalendarizedFinal.term)
        : onlyCourseEvents.length > 0
          ? getFinalsStartDateForTerm(onlyCourseEvents[0].term)
          : getDefaultFinalsStartDate();

    const finalsStartsOnSaturday = showFinalsSchedule && finalsDate.getDay() === 6;

    const culture = finalsStartsOnSaturday ? "en-us-finals" : "en-us";

    const calendarLocalizer = useMemo(() => {
        // eslint-disable-next-line import/no-named-as-default-member
        moment.locale(culture);
        return momentLocalizer(moment);
    }, [culture]);

    // Check if there are any finals on weekends (else only display M-F)
    const hasWeekendFinals =
        showFinalsSchedule &&
        [...finalsEventsInCalendar, hoveredCalendarizedFinal]
            .filter(Boolean)
            .some((event) => event != null && [0, 6].includes(event.start.getDay()));

    const shouldShowWeekView = showFinalsSchedule ? hasWeekendFinals : hasWeekendCourse;
    const calendarView = shouldShowWeekView ? Views.WEEK : Views.WORK_WEEK;

    const finalsDateFormat = isMobile ? "M/DD" : "ddd M/DD";
    const date = showFinalsSchedule ? finalsDate : new Date(2018, 0, 1);

    const formats = useMemo(
        () => ({
            timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
                date.getMinutes() > 0 || !localizer
                    ? ""
                    : localizer.format(date, calendarGutterTimeFormat, culture),
            dayFormat: showFinalsSchedule ? finalsDateFormat : "ddd",
            eventTimeRangeFormat: (
                range: { start: Date; end: Date },
                culture?: string,
                localizer?: DateLocalizer,
            ) =>
                localizer
                    ? `${localizer.format(range.start, calendarTimeFormat, culture)} - ${localizer.format(
                          range.end,
                          calendarTimeFormat,
                          culture,
                      )}`
                    : "",
        }),
        [calendarGutterTimeFormat, calendarTimeFormat, finalsDateFormat, showFinalsSchedule],
    );

    useEffect(() => {
        const updateEventsInCalendar = () => {
            setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
            setEventsInCalendar(AppStore.getEventsInCalendar());
            setFinalEventsInCalendar(AppStore.getFinalEventsInCalendar());
        };

        const updateScheduleNames = () => {
            setScheduleNames(AppStore.getScheduleNames());
        };

        AppStore.on("addedCoursesChange", updateEventsInCalendar);
        AppStore.on("customEventsChange", updateEventsInCalendar);
        AppStore.on("colorChange", updateEventsInCalendar);
        AppStore.on("currentScheduleIndexChange", updateEventsInCalendar);
        AppStore.on("scheduleNamesChange", updateScheduleNames);

        return () => {
            AppStore.off("addedCoursesChange", updateEventsInCalendar);
            AppStore.off("customEventsChange", updateEventsInCalendar);
            AppStore.off("colorChange", updateEventsInCalendar);
            AppStore.off("currentScheduleIndexChange", updateEventsInCalendar);
            AppStore.off("scheduleNamesChange", updateScheduleNames);
        };
    }, []);

    return (
        <Box
            id="calendar-root"
            borderRadius={1}
            flexGrow={1}
            height={"0px"}
            display="flex"
            flexDirection="column"
            position="relative"
        >
            <Backdrop
                sx={(theme) => ({
                    color: "#ffff",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    zIndex: theme.zIndex.drawer + 1,
                    position: "absolute",
                    padding: " 0",
                })}
                open={loadingSchedule}
            />
            <CalendarToolbar
                currentScheduleIndex={currentScheduleIndex}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
                showFinalsSchedule={showFinalsSchedule}
                scheduleNames={scheduleNames}
            />
            <Box id="screenshot" height="0" flexGrow={1}>
                <CalendarEventPopover />

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
                    min={getStartTime()}
                    max={CALENDAR_MAX_DATE}
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

ScheduleCalendar.displayName = "ScheduleCalendar";
