import type { CalendarEvent, CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import type { Schedules } from '$stores/Schedules';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';

export type ScheduleViewScope = 'home' | 'friend';

/**
 * Abstraction for schedule data + mutations used by schedule UI.
 * Home uses AppStore via appScheduleViewSource.
 */
export interface ScheduleViewSource {
    readonly scope: ScheduleViewScope;

    /** When true, UI must not mutate schedule data or call home-only actions (quick search, delete, etc.). */
    readonly readonly: boolean;

    /** When false, all calendar events are shown regardless of the hidden-course map. */
    readonly appliesCourseVisibility: boolean;

    readonly schedule: Schedules;

    getScheduleNames(): string[];
    getCurrentScheduleIndex(): number;
    getCurrentScheduleId(): string;
    getEventsInCalendar(): CalendarEvent[];
    getFinalEventsInCalendar(): CourseEvent[];
    getCourseEventsInCalendar(): CourseEvent[];
    getCustomEventsInCalendar(): CustomEvent[];
    getCurrentScheduleNote(): string;
    getCurrentCustomEvents(): RepeatingCustomEvent[];

    changeCurrentSchedule(index: number): void;

    /** Subscribe to any schedule or index change relevant to this source. */
    subscribe(onChange: () => void): () => void;
}
