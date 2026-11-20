import { getCourseRenameByPreviousId } from '$lib/renames/utils';
import { getCourseRenameByCurrentId } from '$lib/renames/utils';
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

describe('course-rename', () => {
    test('resolves I&C SCI H32 to I&C SCI 32A', () => {
        const rename = getCourseRenameByCurrentId('I&C SCI', 'H32');

        expect(rename).toMatchObject({
            current: { deptCode: 'I&C SCI', courseNumber: 'H32' },
            previously: { deptCode: 'I&C SCI', courseNumber: '32A' },
        });
    });
});
