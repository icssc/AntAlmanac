import type { CourseEvent } from '$components/Calendar/types';
import {
    dateToMinutes,
    hasScheduleConflict,
    parseTimeToMinutes,
} from '$components/RightPane/SectionTable/SectionTableBody/helpers';
import type { AASection } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

function makeMeeting(overrides: Partial<AASection['meetings'][number]> = {}): AASection['meetings'][number] {
    return {
        timeIsTBA: false,
        bldg: ['ICS'],
        days: 'MW',
        startTime: { hour: 10, minute: 0 },
        endTime: { hour: 11, minute: 0 },
        ...overrides,
    };
}

function makeSection(meetings: AASection['meetings']): AASection {
    return {
        sectionCode: '12345',
        sectionType: 'Lec',
        sectionNum: 'A',
        units: '4',
        instructors: [],
        meetings,
        status: 'OPEN',
        numCurrentlyEnrolled: { totalEnrolled: 0, sectionEnrolled: 0, newOnlyEnrolled: 0 },
        maxCapacity: '100',
        numOnWaitlist: '',
        numWaitlistCap: '',
        numNewOnlyReserved: '',
    } as AASection;
}

function makeCalendarEvent(startHour: number, startMinute: number, endHour: number, endMinute: number): CourseEvent {
    const start = new Date(2024, 0, 8, startHour, startMinute);
    const end = new Date(2024, 0, 8, endHour, endMinute);

    return {
        start,
        end,
        title: 'Existing',
        color: '#000',
        locations: [],
        showLocationInfo: false,
        finalExam: { examStatus: 'NO_FINAL' },
        courseTitle: 'Existing',
        instructors: [],
        isCustomEvent: false,
        sectionCode: '99999',
    } as CourseEvent;
}

describe('section-table-body helpers', () => {
    test('parseTimeToMinutes handles single-digit hours and minutes', () => {
        expect(parseTimeToMinutes('9:5')).toBe(9 * 60 + 5);
        expect(parseTimeToMinutes('09:05')).toBe(9 * 60 + 5);
    });

    test('detects overlap when section minute is single-digit (not lexicographic)', () => {
        const section = makeSection([
            makeMeeting({
                days: 'M',
                startTime: { hour: 9, minute: 5 },
                endTime: { hour: 10, minute: 0 },
            }),
        ]);

        const calendarEvents = [makeCalendarEvent(9, 30, 10, 30)];

        expect(hasScheduleConflict(section, calendarEvents)).toBe(true);
    });

    test('checks all meetings, not only the first', () => {
        const section = makeSection([
            makeMeeting({ days: 'Tu', startTime: { hour: 8, minute: 0 }, endTime: { hour: 9, minute: 0 } }),
            makeMeeting({ days: 'M', startTime: { hour: 10, minute: 0 }, endTime: { hour: 11, minute: 0 } }),
        ]);

        const calendarEvents = [makeCalendarEvent(10, 30, 11, 30)];

        expect(hasScheduleConflict(section, calendarEvents)).toBe(true);
    });

    test('returns false when times do not overlap on the same day', () => {
        const section = makeSection([
            makeMeeting({ days: 'M', startTime: { hour: 8, minute: 0 }, endTime: { hour: 9, minute: 0 } }),
        ]);

        const calendarEvents = [makeCalendarEvent(10, 0, 11, 0)];

        expect(hasScheduleConflict(section, calendarEvents)).toBe(false);
    });

    test('dateToMinutes uses local wall-clock time', () => {
        const date = new Date(2024, 0, 8, 13, 7);
        expect(dateToMinutes(date)).toBe(13 * 60 + 7);
    });
});
