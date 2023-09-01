import { describe, test, expect } from 'vitest';
import type { ScheduleCourse } from '@packages/antalmanac-types';
import type { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from '$stores/calendarizeHelpers';

describe('calendarize-helpers', () => {
    const courses: ScheduleCourse[] = [
        {
            courseComment: 'string',
            courseNumber: 'string',
            courseTitle: 'string',
            deptCode: 'string',
            prerequisiteLink: 'string',
            section: {
                color: 'string',
                sectionCode: 'string',
                sectionType: 'string',
                sectionNum: 'string',
                units: 'string',
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
                maxCapacity: 'string',
                numCurrentlyEnrolled: {
                    totalEnrolled: 'string',
                    sectionEnrolled: 'string',
                },
                numOnWaitlist: 'string',
                numWaitlistCap: 'string',
                numRequested: 'string',
                numNewOnlyReserved: 'string',
                restrictions: 'string',
                status: 'OPEN',
                sectionComment: 'string',
            },
            term: 'string',
        },
    ];

    const calendarizedCourses = [
        {
            bldg: undefined,
            color: 'string',
            term: 'string',
            title: 'string string',
            courseTitle: 'string',
            instructors: [],
            sectionCode: 'string',
            sectionType: 'string',
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
                bldg: [],
            },
            isCustomEvent: false,
        },
        {
            bldg: undefined,
            color: 'string',
            term: 'string',
            title: 'string string',
            courseTitle: 'string',
            instructors: [],
            sectionCode: 'string',
            sectionType: 'string',
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
                bldg: [],
            },
            isCustomEvent: false,
        },
        {
            bldg: undefined,
            color: 'string',
            term: 'string',
            title: 'string string',
            courseTitle: 'string',
            instructors: [],
            sectionCode: 'string',
            sectionType: 'string',
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
                bldg: [],
            },
            isCustomEvent: false,
        },
    ];

    const calendarizedCourseFinals = [
        {
            bldg: undefined,
            color: 'string',
            term: 'string',
            title: 'string string',
            courseTitle: 'string',
            instructors: [],
            sectionCode: 'string',
            sectionType: 'Fin',
            start: new Date(2018, 0, 0, 1, 2),
            end: new Date(2018, 0, 0, 3, 4),
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
            isCustomEvent: false,
        },
    ];

    const customEvents: RepeatingCustomEvent[] = [
        {
            title: 'title',
            start: '01:02',
            end: '03:04',
            days: [true, false, true, false, true, false, true],
            customEventID: 0,
            color: '#000000',
        },
    ];

    const calendarizedCustomEvents = [
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 0, 1, 2),
            end: new Date(2018, 0, 0, 3, 4),
            title: 'title',
        },
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 2, 1, 2),
            end: new Date(2018, 0, 2, 3, 4),
            title: 'title',
        },
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 4, 1, 2),
            end: new Date(2018, 0, 4, 3, 4),
            title: 'title',
        },
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 6, 1, 2),
            end: new Date(2018, 0, 6, 3, 4),
            title: 'title',
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
