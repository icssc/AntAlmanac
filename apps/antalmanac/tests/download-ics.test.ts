import type { CalendarEvent, CourseEvent, CustomEvent } from '$components/Calendar/types';
import { getEventsFromCourses } from '$lib/download';
import { getDefaultTerm } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import type { DateArray } from 'ics';
import { describe, expect, test } from 'vitest';

const FALL_2023: AATerm = {
    year: '2023',
    quarter: 'Fall',
    shortName: '2023 Fall',
    longName: 'Fall 2023',
    instructionStart: new Date(2023, 8, 28),
    instructionEnd: new Date(2023, 11, 8),
    finalsStart: new Date(2023, 11, 9),
    finalsEnd: new Date(2023, 11, 15),
    socAvailable: new Date(2023, 4, 1),
    isSummerTerm: false,
};

const WINTER_2024: AATerm = {
    year: '2024',
    quarter: 'Winter',
    shortName: '2024 Winter',
    longName: 'Winter 2024',
    instructionStart: new Date(2024, 0, 8),
    instructionEnd: new Date(2024, 2, 15),
    finalsStart: new Date(2024, 2, 16),
    finalsEnd: new Date(2024, 2, 22),
    socAvailable: new Date(2023, 9, 1),
    isSummerTerm: false,
};

function courseEvent(term: AATerm): CourseEvent {
    return {
        color: 'placeholderColor',
        start: new Date(2023, 9, 29, 1, 2),
        end: new Date(2023, 9, 29, 3, 4),
        title: 'placeholderDeptCode placeholderCourseNumber',
        locations: [{ building: 'placeholderLocation', room: 'placeholderRoom', days: 'MWF' }],
        showLocationInfo: true,
        finalExam: {
            examStatus: 'NO_FINAL',
        },
        courseTitle: 'placeholderCourseTitle',
        instructors: ['placeholderInstructor'],
        eventKind: 'course',
        sectionCode: 'placeholderSectionCode',
        deptValue: 'placeholderDeptCode',
        courseNumber: 'placeholderCourseNumber',
        sectionType: 'placeholderSectionType',
        term,
    };
}

function customEvent(): CustomEvent {
    return {
        color: 'placeholderColor',
        start: new Date(2023, 9, 29, 9, 0),
        end: new Date(2023, 9, 29, 10, 0),
        title: 'placeholderCustomEventTitle',
        customEventID: '123',
        eventKind: 'custom',
        days: ['M'],
        building: 'placeholderCustomEventBuilding',
    };
}

describe('download-ics', () => {
    test('converts schedule courses to events for the ics library', () => {
        const courses: CalendarEvent[] = [
            // CourseEvent
            {
                color: 'placeholderColor',
                start: new Date(2023, 9, 29, 1, 2),
                end: new Date(2023, 9, 29, 3, 4),
                title: 'placeholderDeptCode placeholderCourseNumber',
                locations: [{ building: 'placeholderLocation', room: 'placeholderRoom', days: 'MWF' }],
                showLocationInfo: true,
                finalExam: {
                    examStatus: 'SCHEDULED_FINAL',
                    dayOfWeek: 'Mon',
                    month: 2,
                    day: 3,
                    startTime: {
                        hour: 1,
                        minute: 2,
                    },
                    endTime: {
                        hour: 3,
                        minute: 4,
                    },
                    locations: [{ building: 'placeholderFinalLocation', room: 'placeholderFinalRoom' }],
                },
                courseTitle: 'placeholderCourseTitle',
                instructors: ['placeholderInstructor1', 'placeholderInstructor2'],
                eventKind: 'course',
                sectionCode: 'placeholderSectionCode',
                deptValue: 'placeholderDeptCode',
                courseNumber: 'placeholderCourseNumber',
                sectionType: 'placeholderSectionType',
                term: FALL_2023,
            },
            // FinalExamEvent
            {
                color: 'placeholderColor',
                start: new Date(2023, 9, 29, 1, 2),
                end: new Date(2023, 9, 29, 3, 4),
                title: 'placeholderDeptCode placeholderCourseNumber',
                locations: [{ building: 'placeholderLocation', room: 'placeholderRoom', days: 'MWF' }],
                showLocationInfo: true,
                finalExam: {
                    examStatus: 'SCHEDULED_FINAL',
                    dayOfWeek: 'Mon',
                    month: 2,
                    day: 3,
                    startTime: {
                        hour: 1,
                        minute: 2,
                    },
                    endTime: {
                        hour: 3,
                        minute: 4,
                    },
                    locations: [{ building: 'placeholderFinalLocation', room: 'placeholderFinalRoom' }],
                },
                courseTitle: 'placeholderCourseTitle',
                instructors: ['placeholderInstructor1', 'placeholderInstructor2'],
                eventKind: 'course',
                sectionCode: 'placeholderSectionCode',
                deptValue: 'placeholderDeptCode',
                courseNumber: 'placeholderCourseNumber',
                sectionType: 'Fin',
                term: FALL_2023,
            },
            // CustomEvent
            {
                color: 'placeholderColor',
                start: new Date(2023, 9, 29, 1, 2),
                end: new Date(2023, 9, 29, 3, 4),
                title: 'placeholderCustomEventTitle',
                customEventID: '123',
                eventKind: 'custom',
                days: ['M', 'W', 'F'],
                building: 'placeholderCustomEventBuilding',
            },
        ];

        // Custom events use getDefaultTerm(events) — the only course term (FALL_2023 here).
        const result = getEventsFromCourses(courses);

        expect(result).toMatchSnapshot();
    });

    test('schedules custom events in the latest term of a multi-term schedule', () => {
        const courses = [courseEvent(FALL_2023), courseEvent(WINTER_2024), customEvent()];

        const result = getEventsFromCourses(courses);
        const custom = result.find((event) => event.title === 'placeholderCustomEventTitle');

        // Winter 2024 instruction starts on Monday, January 8th; Fall 2023 starts in September.
        expect(custom?.start).toEqual([2024, 1, 8, 9, 0]);
        // Winter is a 10-week term, so a Monday event meets 10 times.
        expect(custom?.recurrenceRule).toEqual('FREQ=WEEKLY;BYDAY=MO;INTERVAL=1;COUNT=10');
    });

    test('schedules custom events in the default term when the schedule has no courses', () => {
        const [custom] = getEventsFromCourses([customEvent()]);
        const [year, month, day] = custom.start as DateArray;
        const defaultTerm = getDefaultTerm();
        const customEventStart = new Date(year, month - 1, day);

        expect(customEventStart.getTime()).toBeGreaterThanOrEqual(defaultTerm.instructionStart.getTime());
        expect(customEventStart.getTime()).toBeLessThanOrEqual(defaultTerm.instructionEnd.getTime());
    });

    test('ics file has the correct contents', () => {
        /* TODO */
    });
});
