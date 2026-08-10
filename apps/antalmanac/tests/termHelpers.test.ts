import { canTermEnrollmentChange, getTermEnrollmentDropDeadline } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

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

function getPacificTimeParts(date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PACIFIC_TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: true,
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

    return {
        year: getPart('year'),
        month: getPart('month'),
        day: getPart('day'),
        hour: getPart('hour'),
        minute: getPart('minute'),
        second: getPart('second'),
        fractionalSecond: getPart('fractionalSecond'),
        dayPeriod: getPart('dayPeriod'),
    };
}

describe('canTermEnrollmentChange', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('stays open through Friday 5 PM and closes after that', () => {
        vi.useFakeTimers();

        const dropDeadline = getTermEnrollmentDropDeadline(FALL_2024);
        expect(getPacificTimeParts(dropDeadline)).toEqual({
            year: '2024',
            month: '9',
            day: '6',
            hour: '5',
            minute: '00',
            second: '00',
            fractionalSecond: '000',
            dayPeriod: 'PM',
        });

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
        expect(getPacificTimeParts(dropDeadline)).toEqual({
            year: '2024',
            month: '6',
            day: '28',
            hour: '11',
            minute: '59',
            second: '59',
            fractionalSecond: '999',
            dayPeriod: 'PM',
        });

        vi.setSystemTime(new Date('2024-06-29T06:59:59.999Z'));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-06-29T07:00:00.000Z'));
        expect(canTermEnrollmentChange(SUMMER_SESSION_I_2024)).toBe(false);
    });

    test('uses the second Friday for Summer Session 10-week', () => {
        vi.useFakeTimers();

        const dropDeadline = getTermEnrollmentDropDeadline(SUMMER_10WK_2024);
        expect(getPacificTimeParts(dropDeadline)).toEqual({
            year: '2024',
            month: '7',
            day: '5',
            hour: '11',
            minute: '59',
            second: '59',
            fractionalSecond: '999',
            dayPeriod: 'PM',
        });

        // 11:59:59.999 PM PDT (UTC-7) = 2024-07-06T06:59:59.999Z
        vi.setSystemTime(new Date('2024-07-06T06:59:59.999Z'));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(true);

        vi.setSystemTime(new Date('2024-07-06T07:00:00.000Z'));
        expect(canTermEnrollmentChange(SUMMER_10WK_2024)).toBe(false);
    });
});
