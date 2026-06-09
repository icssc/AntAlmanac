import { canTermEnrollmentChange } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

const FALL_2024: AATerm = {
    year: '2024',
    quarter: 'Fall',
    shortName: '2024 Fall',
    longName: 'Fall 2024',
    instructionStart: new Date(2024, 7, 26),
    instructionEnd: new Date(2024, 10, 29),
    finalsStart: new Date(2024, 11, 2),
    finalsEnd: new Date(2024, 11, 8),
    socAvailable: new Date(2024, 6, 1),
    isSummerTerm: false,
};

describe('canTermEnrollmentChange', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('stays open through Friday 5 PM and closes after that', () => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date(2024, 8, 5, 23, 59, 59, 999));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 8, 6, 17, 0, 0, 0));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 8, 6, 17, 0, 0, 1));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(false);

        vi.setSystemTime(new Date(2024, 8, 7, 0, 0, 0, 0));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(false);
    });
});
