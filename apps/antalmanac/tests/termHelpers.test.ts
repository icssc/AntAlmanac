import { canTermEnrollmentChange } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

const WINTER_2026: AATerm = {
    year: '2026',
    quarter: 'Winter',
    shortName: '2026 Winter',
    longName: 'Winter 2026',
    instructionStart: new Date(2026, 0, 5),
    instructionEnd: new Date(2026, 2, 13),
    finalsStart: new Date(2026, 2, 14),
    finalsEnd: new Date(2026, 2, 20),
    socAvailable: new Date(2025, 10, 1),
    isSummerTerm: false,
};

describe('canTermEnrollmentChange', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test.each([
        ['Thursday at 11:59 p.m.', new Date(2026, 0, 15, 23, 59), true],
        ['Friday at 4:59:59.999 p.m.', new Date(2026, 0, 16, 16, 59, 59, 999), true],
        ['Friday at exactly 5:00 p.m.', new Date(2026, 0, 16, 17), true],
        ['Friday at 5:00:00.001 p.m.', new Date(2026, 0, 16, 17, 0, 0, 1), false],
        ['Saturday at midnight', new Date(2026, 0, 17), false],
    ])('returns %s at %s', (_description, currentTime, expected) => {
        vi.useFakeTimers();
        vi.setSystemTime(currentTime);

        expect(canTermEnrollmentChange(WINTER_2026)).toBe(expected);
    });
});
