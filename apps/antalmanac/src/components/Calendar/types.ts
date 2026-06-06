import type { AATerm, CustomEventId } from '@packages/antalmanac-types';
import type { WebsocSectionFinalExam } from '@packages/anteater-api/types';
import type { Event } from 'react-big-calendar';

interface CommonCalendarEvent extends Event {
    color: string;
    start: Date;
    end: Date;
    title: string;
}

export enum CalendarEventKind {
    Course = 'course',
    Custom = 'custom',
    Skeleton = 'skeleton',
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
    eventKind: CalendarEventKind.Course;
    locations: Location[];
    showLocationInfo: boolean;
    finalExam: FinalExam;
    courseTitle: string;
    instructors: string[];
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
    eventKind: CalendarEventKind.Custom;
    customEventID: CustomEventId;
    building: string;
    days: string[];
}

export interface SkeletonEvent extends CommonCalendarEvent {
    eventKind: CalendarEventKind.Skeleton;
}

export type CalendarEvent = CourseEvent | CustomEvent | SkeletonEvent;

export function isCourseEvent(event: CalendarEvent): event is CourseEvent {
    return event.eventKind === CalendarEventKind.Course;
}

export function isCustomEvent(event: CalendarEvent): event is CustomEvent {
    return event.eventKind === CalendarEventKind.Custom;
}

export function isSkeletonEvent(event: CalendarEvent): event is SkeletonEvent {
    return event.eventKind === CalendarEventKind.Skeleton;
}
