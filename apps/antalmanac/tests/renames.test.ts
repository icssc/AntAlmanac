import { getRenamedCoursesIdentifiers, getRenamedCoursesLabel, mergeAggregateGrades } from '$lib/renames/utils';
import { buildCourseId } from '@packages/anteater-api/utils';
import { describe, expect, test } from 'vitest';

const courseIds = (deptCode: string, courseNumber: string) =>
    getRenamedCoursesIdentifiers(deptCode, courseNumber).map((ci) => ci.courseId);

describe('getRenamedCoursesIdentifiers', () => {
    test('returns only the searched course when there is no rename', () => {
        expect(getRenamedCoursesIdentifiers('ICS', '31')).toEqual([
            { deptCode: 'ICS', courseNumber: '31', courseId: buildCourseId('ICS', '31') },
        ]);
        expect(courseIds('ICS', '31')).toEqual([buildCourseId('ICS', '31')]);
    });

    test('includes IN4MATX predecessor for SWE renames', () => {
        expect(getRenamedCoursesIdentifiers('SWE', '43')).toEqual([
            { deptCode: 'SWE', courseNumber: '43', courseId: buildCourseId('SWE', '43') },
            { deptCode: 'IN4MATX', courseNumber: '43', courseId: buildCourseId('IN4MATX', '43') },
        ]);
    });

    test('fans out all SWE course numbers from IN4MATX', () => {
        for (const courseNumber of ['113', '141']) {
            const identifiers = getRenamedCoursesIdentifiers('SWE', courseNumber);
            expect(identifiers).toHaveLength(2);
            expect(identifiers[0].courseId).toBe(buildCourseId('SWE', courseNumber));
            expect(identifiers[1].courseId).toBe(buildCourseId('IN4MATX', courseNumber));
        }
    });

    test('includes I&C SCI 32A predecessor when searching H32', () => {
        expect(courseIds('I&C SCI', 'H32')).toEqual([buildCourseId('I&C SCI', 'H32'), buildCourseId('I&C SCI', '32A')]);
    });

    test('does not walk the rename chain when searching a predecessor course number', () => {
        expect(courseIds('I&C SCI', '32A')).toEqual([buildCourseId('I&C SCI', '32A')]);
    });

    test('returns full course keys in rename order', () => {
        expect(getRenamedCoursesIdentifiers('SWE', '117')).toEqual([
            { deptCode: 'SWE', courseNumber: '117', courseId: buildCourseId('SWE', '117') },
            { deptCode: 'IN4MATX', courseNumber: '117', courseId: buildCourseId('IN4MATX', '117') },
        ]);
    });
});

describe('getRenamedCoursesLabel', () => {
    test('describes SWE rename effective year', () => {
        expect(getRenamedCoursesLabel('SWE', '43')).toBe('Previously IN4MATX 43 (before 26/27)');
    });

    test('returns null when there is no rename', () => {
        expect(getRenamedCoursesLabel('ICS', '31')).toBeNull();
    });
});

describe('mergeAggregateGrades', () => {
    test('merges grade counts and weighted GPA across renamed course results', () => {
        const first = {
            sectionList: [{ sectionCode: 'A' }],
            gradeDistribution: { A: 10, B: 0, averageGPA: 4.0 },
        };
        const second = {
            sectionList: [{ sectionCode: 'B' }],
            gradeDistribution: { A: 0, B: 10, averageGPA: 3.0 },
        };

        const merged = mergeAggregateGrades([first, second]);

        expect(merged.sectionList).toHaveLength(2);
        expect(merged.gradeDistribution.A).toBe(10);
        expect(merged.gradeDistribution.B).toBe(10);
        expect(merged.gradeDistribution.averageGPA).toBe(3.5);
    });
});
