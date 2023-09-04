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

        const expectedResult: EventAttributes[] = [
            {
                productId: 'antalmanac/ics',
                startOutputType: 'local',
                endOutputType: 'local',
                title: 'placeholderDeptCode placeholderCourseNumber Final Exam',
                description: 'Final Exam for placeholderCourseTitle',
                start: [NaN, 3, 3, 1, 2],
                end: [NaN, 3, 3, 3, 4],
            },
        ];

        const result = getEventsFromCourses(courses);

        expect(result).toEqual(expectedResult);
    });

    test('ics file has the correct contents', () => {
        /* TODO */
    });
});
