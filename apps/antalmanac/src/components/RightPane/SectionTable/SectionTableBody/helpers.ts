import AppStore from '$stores/AppStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';
import { AASection } from '@packages/antalmanac-types';
import type { WebsocSectionMeeting } from '@packages/anteater-api/types';

export type CalendarCourseEvents = ReturnType<typeof AppStore.getCourseEventsInCalendar>;

/** Parses `H:MM` / `HH:MM` (WebSOC-normalized) into minutes from midnight. */
export function parseTimeToMinutes(time: string): number | undefined {
    const match = /^(\d{1,2}):(\d{1,2})$/.exec(time);
    if (!match) {
        return undefined;
    }

    return Number(match[1]) * 60 + Number(match[2]);
}

export function dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

function meetingOverlapsCalendarEvent(meeting: WebsocSectionMeeting, event: CalendarCourseEvents[number]): boolean {
    const daysOccurring = parseDaysString(meeting.timeIsTBA ? null : meeting.days);
    const normalizedTime = normalizeTime(meeting);

    if (!normalizedTime) {
        return false;
    }

    const startMinutes = parseTimeToMinutes(normalizedTime.startTime);
    const endMinutes = parseTimeToMinutes(normalizedTime.endTime);

    if (startMinutes === undefined || endMinutes === undefined) {
        return false;
    }

    if (!daysOccurring?.includes(event.start.getDay())) {
        return false;
    }

    const eventStartMinutes = dateToMinutes(event.start);
    const eventEndMinutes = dateToMinutes(event.end);
    const happensBefore = endMinutes <= eventStartMinutes;
    const happensAfter = startMinutes >= eventEndMinutes;

    return !(happensBefore || happensAfter);
}

export function hasScheduleConflict(section: AASection, calendarEvents: CalendarCourseEvents): boolean {
    if (calendarEvents.length === 0 || section.meetings.length === 0) {
        return false;
    }

    return section.meetings.some((meeting) =>
        calendarEvents.some((event) => meetingOverlapsCalendarEvent(meeting, event))
    );
}

export function buildSectionConflictMap(
    sections: AASection[],
    calendarEvents: CalendarCourseEvents
): Map<string, boolean> {
    const conflicts = new Map<string, boolean>();

    for (const section of sections) {
        conflicts.set(section.sectionCode, hasScheduleConflict(section, calendarEvents));
    }

    return conflicts;
}
