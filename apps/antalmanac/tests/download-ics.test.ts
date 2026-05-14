import type { CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
import { getEventsFromCourses } from '$lib/download';
import type { AATerm } from '$lib/term';
import { describe, test, expect } from 'vitest';

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

const SPRING_2024: AATerm = {
    year: '2024',
    quarter: 'Spring',
    shortName: '2024 Spring',
    longName: 'Spring 2024',
    instructionStart: new Date(2024, 3, 1),
    instructionEnd: new Date(2024, 5, 7),
    finalsStart: new Date(2024, 5, 8),
    finalsEnd: new Date(2024, 5, 14),
    socAvailable: new Date(2024, 1, 1),
    isSummerTerm: false,
};

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
                isCustomEvent: false,
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
                isCustomEvent: false,
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
                isCustomEvent: true,
                days: ['M', 'W', 'F'],
                building: 'placeholderCustomEventBuilding',
            },
        ];

        const result = getEventsFromCourses(courses, SPRING_2024);

        expect(result).toMatchSnapshot();
    });

    test('ics file has the correct contents', () => {
        /* TODO */
    });
});
