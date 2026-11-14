import { getCourseRenameByPreviousId } from '$lib/renames/utils';
import { describe, expect, test } from 'vitest';

describe('course-rename', () => {
    test('resolves I&C SCI 32A to I&C SCI H32', () => {
        const rename = getCourseRenameByPreviousId('I&C SCI', '32A');

        expect(rename).toMatchObject({
            previously: { deptCode: 'I&C SCI', courseNumber: '32A' },
            current: { deptCode: 'I&C SCI', courseNumber: 'H32' },
        });
    });
});
