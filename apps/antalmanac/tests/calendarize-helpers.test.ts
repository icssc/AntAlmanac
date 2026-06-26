import type { CourseEvent, CustomEvent } from '$components/Calendar/types';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from '$stores/calendarizeHelpers';
import type { AATerm, Schedule, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { describe, test, expect } from 'vitest';

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

describe('calendarize-helpers', () => {
    const courses: Schedule['courses'] = [
        {
            courseComment: 'placeholderCourseComment',
            courseNumber: 'placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            deptCode: 'placeholderDeptCode',
            prerequisiteLink: 'placeholderPrerequisiteLink',
            courseId: 'PLACEHOLDER',
            sections: [
                {
                    color: 'placeholderColor',
                    sectionCode: 'placeholderSectionCode',
                    sectionType: 'Lec',
                    sectionNum: 'placeholderSectionNum',
                    units: 'placeholderUnits',
                    instructors: [],
                    meetings: [
                        {
                            timeIsTBA: false,
                            bldg: [],
                            days: 'MWF',
                            startTime: {
                                hour: 1,
                                minute: 2,
                            },
                            endTime: {
                                hour: 3,
                                minute: 4,
                            },
                        },
                    ],
                    finalExam: {
                        examStatus: 'SCHEDULED_FINAL',
                        dayOfWeek: 'Sun',
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
                        bldg: [],
                    },
                    maxCapacity: 'placeholderMaxCapacity',
                    numCurrentlyEnrolled: {
                        totalEnrolled: 'placeholderTotalEnrolled',
                        sectionEnrolled: 'placeholderSectionEnrolled',
                    },
                    numOnWaitlist: 'placeholderNumOnWaitlist',
                    numWaitlistCap: 'placeholderNumWaitlistCap',
                    numRequested: 'placeholderNumRequested',
                    numNewOnlyReserved: 'placeholderNumNewOnlyReserved',
                    restrictions: 'placeholderRestrictions',
                    status: 'OPEN',
                    sectionComment: 'placeholderSectionComment',
                    updatedAt: 'placeholderUpdatedAt',
                    webURL: '',
                    isCancelled: false,
                },
            ],
            term: WINTER_2024,
            sectionTypes: ['Lec'],
            updatedAt: null,
        },
    ];

    // 3 of the same event
    const calendarizedCourses: CourseEvent[] = [
        {
            locations: [],
            color: 'placeholderColor',
            term: WINTER_2024,
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'Lec',
            start: new Date(2018, 0, 1, 1, 2),
            end: new Date(2018, 0, 1, 3, 4),
            finalExam: {
                examStatus: 'SCHEDULED_FINAL',
                dayOfWeek: 'Sun',
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
                locations: [],
            },
            showLocationInfo: false,
            eventKind: 'course',
            deptValue: 'placeholderDeptCode',
            courseNumber: 'placeholderCourseNumber',
        },
        {
            locations: [],
            color: 'placeholderColor',
            term: WINTER_2024,
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'Lec',
            start: new Date(2018, 0, 3, 1, 2),
            end: new Date(2018, 0, 3, 3, 4),
            finalExam: {
                examStatus: 'SCHEDULED_FINAL',
                dayOfWeek: 'Sun',
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
                locations: [],
            },
            showLocationInfo: false,
            eventKind: 'course',
            deptValue: 'placeholderDeptCode',
            courseNumber: 'placeholderCourseNumber',
        },
        {
            locations: [],
            color: 'placeholderColor',
            term: WINTER_2024,
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'Lec',
            start: new Date(2018, 0, 5, 1, 2),
            end: new Date(2018, 0, 5, 3, 4),
            finalExam: {
                examStatus: 'SCHEDULED_FINAL',
                dayOfWeek: 'Sun',
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
                locations: [],
            },
            showLocationInfo: false,
            eventKind: 'course',
            deptValue: 'placeholderDeptCode',
            courseNumber: 'placeholderCourseNumber',
        },
    ];

    const calendarizedCourseFinals: CourseEvent[] = [
        {
            locations: [],
            color: 'placeholderColor',
            term: WINTER_2024,
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseNumber: 'placeholderCourseNumber',
            deptValue: 'placeholderDeptCode',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'Fin',
            start: new Date(2024, 2, 17, 1, 2), // Winter 2024 dates
            end: new Date(2024, 2, 17, 3, 4), // ...
            finalExam: {
                examStatus: 'SCHEDULED_FINAL',
                dayOfWeek: 'Sun',
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
                locations: [],
            },
            showLocationInfo: true,
            eventKind: 'course',
        },
    ];

    const customEvents: RepeatingCustomEvent[] = [
        {
            title: 'title',
            start: '01:02',
            end: '03:04',
            days: [true, false, true, false, true, false, true],
            customEventID: '0',
            color: '#000000',
        },
    ];

    const calendarizedCustomEvents: CustomEvent[] = [
        {
            eventKind: 'custom',
            customEventID: '0',
            color: '#000000',
            start: new Date(2018, 0, 0, 1, 2),
            end: new Date(2018, 0, 0, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            eventKind: 'custom',
            customEventID: '0',
            color: '#000000',
            start: new Date(2018, 0, 2, 1, 2),
            end: new Date(2018, 0, 2, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            eventKind: 'custom',
            customEventID: '0',
            color: '#000000',
            start: new Date(2018, 0, 4, 1, 2),
            end: new Date(2018, 0, 4, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            eventKind: 'custom',
            customEventID: '0',
            color: '#000000',
            start: new Date(2018, 0, 6, 1, 2),
            end: new Date(2018, 0, 6, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
    ];

    test('calendarizeCourseEvents', () => {
        const result = calendarizeCourseEvents(courses);
        expect(result).toStrictEqual(calendarizedCourses);
    });

    test('calendarizeFinals', () => {
        const result = calendarizeFinals(courses);
        expect(result).toStrictEqual(calendarizedCourseFinals);
    });

    test('calendarizeCustomEvents', () => {
        const result = calendarizeCustomEvents(customEvents);
        expect(result).toStrictEqual(calendarizedCustomEvents);
    });
});
