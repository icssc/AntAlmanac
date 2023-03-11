import type { WebsocCourse, WebsocSection } from 'peterportal-api-next-types';
import { z } from 'zod';

//-----------------------------------------------------------------------------------
// main data entities
//-----------------------------------------------------------------------------------

/**
 * modified section from peterportal websoc
 */
export interface Section extends WebsocSection {
    /**
     * color for the calendar
     */
    color: string;
}

/**
 * modified WebsocCourse from PeterPortal API
 * substitutes the sections array with a single section object
 */
export interface Course extends Omit<WebsocCourse, 'sections'> {
    /**
     * a course in the schedule is associated with a term, e.g. 2020 Fall
     */
    term: string;

    /**
     * a course in the schedule is associated with a single section after it's added
     */
    section: Section;
}

/**
 * custom calendar event, similar to react-big-calendar's events
 */
export interface RepeatingCustomEvent {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    color?: string;
    customEventID: number;
}

/**
 * complete schedule data stored in memory during runtime
 */
export interface Schedule {
    scheduleName: string;
    courses: Course[];
    customEvents: RepeatingCustomEvent[];
}

//-----------------------------------------------------------------------------------
// schedule saving
//-----------------------------------------------------------------------------------

/**
 * trimmed course properties
 */
export interface ShortCourse {
    color: string;
    term: string;
    sectionCode: string;
}

/**
 * minimal schedule
 */
export interface ShortCourseSchedule {
    scheduleName: string;
    courses: ShortCourse[];
    customEvents: RepeatingCustomEvent[];
}

/**
 * minimal schedule data stored in database
 */
export interface SavedSchedule {
    schedules: ShortCourseSchedule[];
    scheduleIndex: number;
}

//-----------------------------------------------------------------------------------
// legacy support
//-----------------------------------------------------------------------------------

export interface LegacyShortCourseInfo extends ShortCourse {
    scheduleIndices: number[];
}

export interface LegacyRepeatingCustomEvent extends RepeatingCustomEvent {
    scheduleIndices: number[];
}

export interface LegacySavedSchedule {
    addedCourses: LegacyShortCourseInfo[];
    scheduleNames: string[];
    customEvents: LegacyRepeatingCustomEvent[];
}

//-----------------------------------------------------------------------------------
// schemas specifically related to schedules and AA internals
//-----------------------------------------------------------------------------------

export const repeatingCustomEventSchema = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    days: z.boolean().array(),
    customEventID: z.number(),
    color: z.string().optional(),
});

export const shortCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    sectionCode: z.string(),
});

export const shortCourseScheduleSchema = z.object({
    scheduleName: z.string(),
    courses: shortCourseSchema.array(),
    customEvents: repeatingCustomEventSchema.array(),
});

export const scheduleSaveStateSchema = z.object({
    schedules: shortCourseScheduleSchema.array(),
    scheduleIndex: z.number(),
});
