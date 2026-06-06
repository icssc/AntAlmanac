import type { AATerm, CustomEventId } from '@packages/antalmanac-types';
import type { WebsocSectionFinalExam } from '@packages/anteater-api/types';
import type { Event } from 'react-big-calendar';

interface CommonCalendarEvent extends Event {
    color: string;
    start: Date;
    end: Date;
    title: string;
}

export interface Location {
    /**
     * @example 'ICS'
     */
    building: string;

    /**
     * @example '174'
     */
    room: string;

    /**
     * If the location only applies on specific days, this is non-null.
     */
    days?: string;
}

export type FinalExam =
    | (Omit<Extract<WebsocSectionFinalExam, { examStatus: 'SCHEDULED_FINAL' }>, 'bldg'> & { locations: Location[] })
    | Extract<WebsocSectionFinalExam, { examStatus: 'NO_FINAL' | 'TBA_FINAL' }>;

export interface CourseEvent extends CommonCalendarEvent {
    locations: Location[];
    showLocationInfo: boolean;
    finalExam: FinalExam;
    courseTitle: string;
    instructors: string[];
    isCustomEvent: false;
    sectionCode: string;
    sectionType: string;
    deptValue: string;
    courseNumber: string;
    term: AATerm;
}

/**
 * There is another CustomEvent interface in CustomEventDialog and they are slightly different.
 * This one represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * The other one, `CustomEventDialog`'s `RepeatingCustomEvent`, encapsulates the occurrences of an event on multiple days.
 */
export interface CustomEvent extends CommonCalendarEvent {
    customEventID: CustomEventId;
    isCustomEvent: true;
    building: string;
    days: string[];
}

export interface SkeletonEvent extends CommonCalendarEvent {
    isSkeletonEvent: true;
}

export type CalendarEvent = CourseEvent | CustomEvent | SkeletonEvent;

export function isSkeletonEvent(event: CalendarEvent): event is SkeletonEvent {
    return 'isSkeletonEvent' in event && event.isSkeletonEvent;
}

export function isCourseEvent(event: CalendarEvent): event is CourseEvent {
    return 'isCustomEvent' in event && !event.isCustomEvent;
}
