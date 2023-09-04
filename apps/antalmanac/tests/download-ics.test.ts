import { EventAttributes } from 'ics';
import type { Schedule } from '@packages/antalmanac-types';
import { describe, test, expect } from 'vitest';
import { getEventsFromCourses } from '$lib/download';

describe('download-ics', () => {
    test('converts schedule courses to events for the ics library', () => {
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
                    instructors: ['placeholderInstructor1', 'placeholderInstructor2'],
                    meetings: [
                        {
                            timeIsTBA: false,
                            bldg: ['placeholderLocation'],
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
                term: '2023 Fall', // Cannot be a random placeholder; it has to be in `quarterStartDates` otherwise it'll be undefined
            },
        ];

        const expectedResult: EventAttributes[] = [
            {
                productId: 'antalmanac/ics',
                startOutputType: 'local',
                endOutputType: 'local',
                title: 'placeholderDeptCode placeholderCourseNumber placeholderSectionType',
                description: 'placeholderCourseTitle\nTaught by placeholderInstructor1/placeholderInstructor2',
                location: 'placeholderLocation',
                start: [2023, 9, 29, 1, 2],
                end: [2023, 9, 29, 3, 4],
                recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR,MO,WE;INTERVAL=1;COUNT=31',
            },
            {
                productId: 'antalmanac/ics',
                startOutputType: 'local',
                endOutputType: 'local',
                title: 'placeholderDeptCode placeholderCourseNumber Final Exam',
                description: 'Final Exam for placeholderCourseTitle',
                start: [2023, 3, 3, 1, 2],
                end: [2023, 3, 3, 3, 4],
            },
        ];

        const result = getEventsFromCourses(courses);

        expect(result).toEqual(expectedResult);
    });

    test('ics file has the correct contents', () => {
        /* TODO */
    });
});
