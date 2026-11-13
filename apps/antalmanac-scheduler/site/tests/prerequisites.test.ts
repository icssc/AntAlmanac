import type { Prerequisite } from '@packages/anteater-api/types';
import { formatPrerequisite, getRenderablePrerequisiteTreeGroup } from '@packages/anteater-api/utils';
import { describe, expect, it } from 'vitest';

describe('formatPrerequisite', () => {
    it.each([
        [
            { prereqType: 'course', coreq: true, courseId: 'DRAMA 10', minGrade: 'D-' },
            'DRAMA 10 (coreq) (min grade = D-)',
        ],
        [{ prereqType: 'exam', examName: 'SAT Mathematics', minGrade: '600' }, 'SAT Mathematics (min score = 600)'],
        [{ prereqType: 'standing', standing: { type: 'classLevel', value: 'JUNIOR' } }, 'JUNIOR STANDING'],
        [
            { prereqType: 'standing', standing: { type: 'writingRequirement', value: 'LOWER DIVISION WRITING' } },
            'LOWER DIVISION WRITING',
        ],
        [
            { prereqType: 'affiliation', affiliation: { type: 'major', value: 'BIOLOGICAL SCIENCES' } },
            'BIOLOGICAL SCIENCES MAJORS ONLY',
        ],
        [
            { prereqType: 'affiliation', affiliation: { type: 'school', value: 'ENGINEERING' } },
            'SCHOOL OF ENGINEERING ONLY',
        ],
        [{ prereqType: 'affiliation', affiliation: { type: 'CHC' } }, 'CAMPUSWIDE HONORS ONLY'],
    ] satisfies [Prerequisite, string][])('formats %#', (prerequisite, expected) => {
        expect(formatPrerequisite(prerequisite)).toBe(expected);
    });
});

describe('getRenderablePrerequisiteTreeGroup', () => {
    it('combines multiple root operators without dropping NOT groups', () => {
        const requiredCourse: Prerequisite = {
            prereqType: 'course',
            coreq: false,
            courseId: 'I&C SCI 31',
        };
        const forbiddenCourse: Prerequisite = {
            prereqType: 'course',
            coreq: false,
            courseId: 'I&C SCI 32',
        };

        expect(getRenderablePrerequisiteTreeGroup({ AND: [requiredCourse], NOT: [forbiddenCourse] })).toEqual([
            'AND',
            [requiredCourse, { NOT: [forbiddenCourse] }],
        ]);
    });
});
