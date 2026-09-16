import type { CalendarEvent } from '$components/Calendar/types';
import { getEventsFromCourses } from '$lib/download';
import { getDefaultTerm } from '$lib/term';
import type { DateArray } from 'ics';
import { describe, expect, test } from 'vitest';

import { FALL_2023, WINTER_2024, courseEvent, customEvent } from './helpers/term-fixtures';

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
