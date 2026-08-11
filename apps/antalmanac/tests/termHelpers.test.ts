import { canTermEnrollmentChange, getTermEnrollmentDropDeadline } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { formatInTimeZone } from 'date-fns-tz';
import { afterEach, describe, expect, test, vi } from 'vitest';

const PACIFIC_TIME_ZONE = 'America/Los_Angeles';
const PACIFIC_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';

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

        const dropDeadline = getTermEnrollmentDropDeadline(FALL_2024);
        expect(formatInTimeZone(dropDeadline, PACIFIC_TIME_ZONE, PACIFIC_TIME_FORMAT)).toBe('2024-09-06 17:00:00.000');

        vi.setSystemTime(new Date('2024-09-06T23:59:59.999Z'));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-09-07T00:00:00.000Z'));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-09-07T00:00:00.001Z'));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(false);

        vi.setSystemTime(new Date('2024-09-07T12:00:00.000Z'));
        expect(canTermEnrollmentChange(FALL_2024)).toBe(false);
    });

    test('uses the first Friday for Summer Session I', () => {
        vi.useFakeTimers();

        const dropDeadline = getTermEnrollmentDropDeadline(SUMMER_SESSION_I_2024);
        expect(formatInTimeZone(dropDeadline, PACIFIC_TIME_ZONE, PACIFIC_TIME_FORMAT)).toBe('2024-06-28 23:59:59.999');

        vi.setSystemTime(new Date('2024-06-29T06:59:59.999Z'));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-06-29T07:00:00.000Z'));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(false);
    });

    test('uses the second Friday for Summer Session 10-week', () => {
        vi.useFakeTimers();

        const dropDeadline = getTermEnrollmentDropDeadline(SUMMER_10WK_2024);
        expect(formatInTimeZone(dropDeadline, PACIFIC_TIME_ZONE, PACIFIC_TIME_FORMAT)).toBe('2024-07-05 23:59:59.999');

        // 11:59:59.999 PM PDT (UTC-7) = 2024-07-06T06:59:59.999Z
        vi.setSystemTime(new Date('2024-07-06T06:59:59.999Z'));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-07-06T07:00:00.000Z'));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(false);
    });
});
