import type { CourseEvent, CustomEvent } from '$components/Calendar/types';
import type { AATerm } from '@packages/antalmanac-types';

export const FALL_2023: AATerm = {
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

export const WINTER_2024: AATerm = {
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

export function courseEvent(term: AATerm): CourseEvent {
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

export function customEvent(): CustomEvent {
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
