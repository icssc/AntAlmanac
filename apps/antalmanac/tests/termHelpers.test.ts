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

const SUMMER_SESSION_I_2024: AATerm = {
    year: '2024',
    quarter: 'Summer1',
    shortName: '2024 Summer1',
    longName: 'Summer Session I 2024',
    instructionStart: new Date(2024, 5, 24),
    instructionEnd: new Date(2024, 6, 27),
    finalsStart: new Date(2024, 6, 28),
    finalsEnd: new Date(2024, 6, 28),
    socAvailable: new Date(2024, 4, 1),
    isSummerTerm: true,
};

const SUMMER_10WK_2024: AATerm = {
    year: '2024',
    quarter: 'Summer10wk',
    shortName: '2024 Summer10wk',
    longName: 'Summer Session 10-Week 2024',
    instructionStart: new Date(2024, 5, 24),
    instructionEnd: new Date(2024, 7, 29),
    finalsStart: new Date(2024, 7, 30),
    finalsEnd: new Date(2024, 7, 30),
    socAvailable: new Date(2024, 4, 1),
    isSummerTerm: true,
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

    test('uses the first Friday for Summer Session I', () => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date(2024, 5, 28, 16, 59, 59, 999));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 5, 28, 23, 59, 59, 999));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 5, 29, 0, 0, 0, 0));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(false);
    });

    test('uses the second Friday for Summer Session 10-week', () => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date(2024, 6, 5, 16, 59, 59, 999));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 6, 5, 23, 59, 59, 999));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(true);

        vi.setSystemTime(new Date(2024, 6, 6, 0, 0, 0, 0));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(false);
    });
});
