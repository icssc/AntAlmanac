import { describe, test, expect } from 'vitest';
import type { Schedule } from '@packages/antalmanac-types';
import type { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from '$stores/calendarizeHelpers';
import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';

describe('calendarize-helpers', () => {
    const courses: Schedule['courses'] = [
        {
            courseComment: 'placeholderCourseComment',
            courseNumber: 'placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            deptCode: 'placeholderDeptCode',
            prerequisiteLink: 'placeholderPrerequisiteLink',
            section: {
                color: 'placeholderColor',
                sectionCode: 'placeholderSectionCode',
                sectionType: 'placeholderSectionType',
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
            },
            term: 'placeholderTerm',
        },
    ];

    // 3 of the same event
    const calendarizedCourses: CourseEvent[] = [
        {
            locations: [],
            color: 'placeholderColor',
            term: 'placeholderTerm',
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'placeholderSectionType',
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
            isCustomEvent: false,
        },
        {
            locations: [],
            color: 'placeholderColor',
            term: 'placeholderTerm',
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'placeholderSectionType',
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
            isCustomEvent: false,
        },
        {
            locations: [],
            color: 'placeholderColor',
            term: 'placeholderTerm',
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
            sectionType: 'placeholderSectionType',
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
            isCustomEvent: false,
        },
    ];

    const calendarizedCourseFinals: CourseEvent[] = [
        {
            locations: [],
            color: 'placeholderColor',
            term: 'placeholderTerm',
            title: 'placeholderDeptCode placeholderCourseNumber',
            courseTitle: 'placeholderCourseTitle',
            instructors: [],
            sectionCode: 'placeholderSectionCode',
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
                locations: [],
            },
            showLocationInfo: true,
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

    const calendarizedCustomEvents: CustomEvent[] = [
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 0, 1, 2),
            end: new Date(2018, 0, 0, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 2, 1, 2),
            end: new Date(2018, 0, 2, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            isCustomEvent: true,
            customEventID: 0,
            color: '#000000',
            start: new Date(2018, 0, 4, 1, 2),
            end: new Date(2018, 0, 4, 3, 4),
            title: 'title',
            building: '',
            days: ['Su', 'Tu', 'Th', 'Sa'],
        },
        {
            isCustomEvent: true,
            customEventID: 0,
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
