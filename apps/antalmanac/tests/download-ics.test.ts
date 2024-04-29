import { describe, test, expect } from 'vitest';

import { CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
import { getEventsFromCourses } from '$lib/download';

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
                // We don't use finalExam anymore for calendar file export,
                // instead, FinalExamEvent is used
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
                isCustomEvent: false,
                sectionCode: 'placeholderSectionCode',
                sectionType: 'placeholderSectionType',
                term: '2023 Fall', // Cannot be a random placeholder; it has to be in `quarterStartDates` otherwise it'll be undefined
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
                isCustomEvent: false,
                sectionCode: 'placeholderSectionCode',
                sectionType: 'Fin',
                term: '2023 Fall', // Cannot be a random placeholder; it has to be in `quarterStartDates` otherwise it'll be undefined
            },
            // CustomEvent
            {
                color: 'placeholderColor',
                start: new Date(2023, 9, 29, 1, 2),
                end: new Date(2023, 9, 29, 3, 4),
                title: 'placeholderCustomEventTitle',
                customEventID: 123,
                isCustomEvent: true,
                days: ['M', 'W', 'F'],
                building: 'placeholderCustomEventBuilding',
            },
        ];

        const result = getEventsFromCourses(courses, '2024 Spring');

        expect(result).toMatchSnapshot();
    });

    test('ics file has the correct contents', () => {
        /* TODO */
    });
});
