import { filterCancelledSectionsFromResponse, getOfferedCourseSet, isCourseOffered } from '$lib/courseAvailability';
import type { SectionSearchResult } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';
import { describe, expect, test } from 'vitest';

function makeSection(
    overrides: Partial<SectionSearchResult> & Pick<SectionSearchResult, 'department' | 'courseNumber' | 'sectionCode'>
): SectionSearchResult {
    return {
        type: 'SECTION',
        sectionNum: 'A',
        sectionType: 'Lec',
        ...overrides,
    };
}

function makeWebsocResponse(): WebsocAPIResponse {
    return {
        schools: [
            {
                schoolName: 'ICS',
                schoolComment: '',
                departments: [
                    {
                        deptCode: 'COMPSCI',
                        deptName: 'Computer Science',
                        deptComment: '',
                        courses: [
                            {
                                deptCode: 'COMPSCI',
                                courseNumber: '161',
                                courseTitle: 'Design and Analysis of Algorithms',
                                courseComment: '',
                                prerequisiteLink: '',
                                updatedAt: null,
                                sections: [
                                    {
                                        sectionCode: '12345',
                                        sectionType: 'Lec',
                                        sectionNum: 'A',
                                        units: '4',
                                        instructors: ['Staff'],
                                        meetings: [],
                                        finalExam: {
                                            examStatus: 'NO_FINAL',
                                        },
                                        maxCapacity: '100',
                                        numCurrentlyEnrolled: {
                                            totalEnrolled: '0',
                                            sectionEnrolled: '0',
                                        },
                                        numOnWaitlist: '0',
                                        numWaitlistCap: '0',
                                        numRequested: '0',
                                        numNewOnlyReserved: '0',
                                        restrictions: '',
                                        status: 'OPEN',
                                        sectionComment: 'Cancelled by department',
                                        isCancelled: true,
                                        updatedAt: null,
                                        webURL: '',
                                    },
                                    {
                                        sectionCode: '12346',
                                        sectionType: 'Dis',
                                        sectionNum: 'B1',
                                        units: '4',
                                        instructors: ['Staff'],
                                        meetings: [],
                                        finalExam: {
                                            examStatus: 'NO_FINAL',
                                        },
                                        maxCapacity: '30',
                                        numCurrentlyEnrolled: {
                                            totalEnrolled: '0',
                                            sectionEnrolled: '0',
                                        },
                                        numOnWaitlist: '0',
                                        numWaitlistCap: '0',
                                        numRequested: '0',
                                        numNewOnlyReserved: '0',
                                        restrictions: '',
                                        status: 'OPEN',
                                        sectionComment: '',
                                        isCancelled: false,
                                        updatedAt: null,
                                        webURL: '',
                                    },
                                ],
                            },
                            {
                                deptCode: 'COMPSCI',
                                courseNumber: '162',
                                courseTitle: 'Canceled Course',
                                courseComment: '',
                                prerequisiteLink: '',
                                updatedAt: null,
                                sections: [
                                    {
                                        sectionCode: '22345',
                                        sectionType: 'Lec',
                                        sectionNum: 'A',
                                        units: '4',
                                        instructors: ['Staff'],
                                        meetings: [],
                                        finalExam: {
                                            examStatus: 'NO_FINAL',
                                        },
                                        maxCapacity: '100',
                                        numCurrentlyEnrolled: {
                                            totalEnrolled: '0',
                                            sectionEnrolled: '0',
                                        },
                                        numOnWaitlist: '0',
                                        numWaitlistCap: '0',
                                        numRequested: '0',
                                        numNewOnlyReserved: '0',
                                        restrictions: '',
                                        status: 'OPEN',
                                        sectionComment: 'Canceled',
                                        isCancelled: true,
                                        updatedAt: null,
                                        webURL: '',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                schoolName: 'Physical Sciences',
                schoolComment: '',
                departments: [
                    {
                        deptCode: 'MATH',
                        deptName: 'Mathematics',
                        deptComment: '',
                        courses: [
                            {
                                deptCode: 'MATH',
                                courseNumber: '2A',
                                courseTitle: 'Calculus',
                                courseComment: '',
                                prerequisiteLink: '',
                                updatedAt: null,
                                sections: [
                                    {
                                        sectionCode: '32345',
                                        sectionType: 'Lec',
                                        sectionNum: 'A',
                                        units: '4',
                                        instructors: ['Staff'],
                                        meetings: [],
                                        finalExam: {
                                            examStatus: 'NO_FINAL',
                                        },
                                        maxCapacity: '100',
                                        numCurrentlyEnrolled: {
                                            totalEnrolled: '0',
                                            sectionEnrolled: '0',
                                        },
                                        numOnWaitlist: '0',
                                        numWaitlistCap: '0',
                                        numRequested: '0',
                                        numNewOnlyReserved: '0',
                                        restrictions: '',
                                        status: 'OPEN',
                                        sectionComment: 'Cancelled',
                                        isCancelled: true,
                                        updatedAt: null,
                                        webURL: '',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    } as WebsocAPIResponse;
}

describe('course availability', () => {
    test('treats cancelled-only courses as not offered', () => {
        const offeredCourseSet = getOfferedCourseSet([
            makeSection({ department: 'COMPSCI', courseNumber: '161', sectionCode: '12345', isCancelled: true }),
            makeSection({ department: 'COMPSCI', courseNumber: '161', sectionCode: '12346', isCancelled: false }),
            makeSection({ department: 'MATH', courseNumber: '2A', sectionCode: '32345', isCancelled: true }),
        ]);

        expect(isCourseOffered('COMPSCI', '161', offeredCourseSet)).toBe(true);
        expect(isCourseOffered('MATH', '2A', offeredCourseSet)).toBe(false);
    });

    test('keeps older cache entries without isCancelled marked as offered', () => {
        const offeredCourseSet = getOfferedCourseSet([
            makeSection({ department: 'IN4MATX', courseNumber: '43', sectionCode: '42345' }),
        ]);

        expect(isCourseOffered('IN4MATX', '43', offeredCourseSet)).toBe(true);
    });

    test('removes cancelled sections and prunes empty courses and schools', () => {
        const filteredResponse = filterCancelledSectionsFromResponse(makeWebsocResponse());

        expect(filteredResponse.schools).toHaveLength(1);
        expect(filteredResponse.schools[0].departments).toHaveLength(1);
        expect(filteredResponse.schools[0].departments[0].courses).toHaveLength(1);
        expect(filteredResponse.schools[0].departments[0].courses[0].courseNumber).toBe('161');
        expect(
            filteredResponse.schools[0].departments[0].courses[0].sections.map((section) => section.sectionCode)
        ).toEqual(['12346']);
    });
});
