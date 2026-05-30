import AppStore from '$stores/AppStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';
import { AASection } from '@packages/antalmanac-types';

export type CalendarCourseEvents = ReturnType<typeof AppStore.getCourseEventsInCalendar>;

export function hasScheduleConflict(section: AASection, calendarEvents: CalendarCourseEvents): boolean {
    const daysOccurring = parseDaysString(section.meetings[0].timeIsTBA ? null : section.meetings[0].days);
    const normalizedTime = normalizeTime(section.meetings[0]);

    if (calendarEvents.length === 0 || !normalizedTime) {
        return false;
    }

    const { startTime, endTime } = normalizedTime;

    return calendarEvents.some((event) => {
        if (!daysOccurring?.includes(event.start.getDay())) {
            return false;
        }

        const eventStartTime = event.start.toTimeString().slice(0, 5);
        const eventEndTime = event.end.toTimeString().slice(0, 5);
        const happensBefore = endTime <= eventStartTime;
        const happensAfter = startTime >= eventEndTime;

        return !(happensBefore || happensAfter);
    });
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
