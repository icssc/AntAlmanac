import { formatPrerequisite } from '@packages/anteater-api/utils';
import type { Prerequisite } from '@peterportal/types';

import { isRoadmapVerifiablePrerequisite } from './prerequisites';

describe('formatPrerequisite', () => {
    it.each([
        [{ prereqType: 'course', coreq: false, courseId: 'I&C SCI 31', minGrade: 'C' }, 'I&C SCI 31 (min grade = C)'],
        [
            { prereqType: 'course', coreq: true, courseId: 'DRAMA 10', minGrade: 'D-' },
            'DRAMA 10 (coreq) (min grade = D-)',
        ],
        [{ prereqType: 'exam', examName: 'AP CALCULUS BC', minGrade: '4' }, 'AP CALCULUS BC (min score = 4)'],
        [
            { prereqType: 'standing', standing: { type: 'classLevel', value: 'UPPER DIVISION' } },
            'UPPER DIVISION STANDING',
        ],
        [{ prereqType: 'standing', standing: { type: 'classLevel', value: 'NEW TRANSFERS' } }, 'NEW TRANSFERS ONLY'],
        [
            { prereqType: 'standing', standing: { type: 'writingRequirement', value: 'ENTRY LEVEL WRITING' } },
            'ENTRY LEVEL WRITING',
        ],
        [
            { prereqType: 'affiliation', affiliation: { type: 'major', value: 'COMPUTER SCI & ENGR' } },
            'COMPUTER SCI & ENGR MAJORS ONLY',
        ],
        [{ prereqType: 'affiliation', affiliation: { type: 'school', value: 'I&C SCI' } }, 'SCHOOL OF I&C SCI ONLY'],
        [{ prereqType: 'affiliation', affiliation: { type: 'CHC' } }, 'CAMPUSWIDE HONORS ONLY'],
    ] satisfies [Prerequisite, string][])('formats %#', (prerequisite, expected) => {
        expect(formatPrerequisite(prerequisite)).toBe(expected);
    });
});

describe('isRoadmapVerifiablePrerequisite', () => {
    it('recognizes course and exam requirements as verifiable', () => {
        expect(isRoadmapVerifiablePrerequisite({ prereqType: 'course', coreq: false, courseId: 'I&C SCI 31' })).toBe(
            true
        );
        expect(isRoadmapVerifiablePrerequisite({ prereqType: 'exam', examName: 'AP CALCULUS BC' })).toBe(true);
    });

    it('recognizes standing and affiliation requirements as unverifiable', () => {
        expect(
            isRoadmapVerifiablePrerequisite({
                prereqType: 'standing',
                standing: { type: 'classLevel', value: 'SENIOR' },
            })
        ).toBe(false);
        expect(
            isRoadmapVerifiablePrerequisite({
                prereqType: 'affiliation',
                affiliation: { type: 'CHC' },
            })
        ).toBe(false);
    });

    it('recognizes trees containing NOT groups as unverifiable', () => {
        expect(
            isRoadmapVerifiablePrerequisite({
                NOT: [{ prereqType: 'course', coreq: false, courseId: 'I&C SCI 31' }],
            })
        ).toBe(false);
    });
});
