import type { PrerequisiteTree } from '@peterportal/types';

import { getMissingPrerequisites } from './planner';

describe('getMissingPrerequisites', () => {
    it('still reports missing course requirements', () => {
        const tree: PrerequisiteTree = {
            AND: [{ prereqType: 'course', coreq: false, courseId: 'I&C SCI 31' }],
        };

        expect(getMissingPrerequisites(new Set(), tree)).toEqual(['I&C SCI 31']);
    });

    it('does not report standing and affiliation requirements as missing courses', () => {
        const tree: PrerequisiteTree = {
            AND: [
                {
                    prereqType: 'standing',
                    standing: { type: 'classLevel', value: 'UPPER DIVISION' },
                },
                {
                    prereqType: 'affiliation',
                    affiliation: { type: 'school', value: 'I&C SCI' },
                },
            ],
        };

        expect(getMissingPrerequisites(new Set(), tree)).toBeUndefined();
    });

    it('continues validating course leaves alongside informational requirements', () => {
        const tree: PrerequisiteTree = {
            AND: [
                { prereqType: 'course', coreq: false, courseId: 'I&C SCI 31' },
                {
                    prereqType: 'standing',
                    standing: { type: 'classLevel', value: 'UPPER DIVISION' },
                },
            ],
        };

        expect(getMissingPrerequisites(new Set(), tree)).toEqual(['I&C SCI 31']);
    });
});
