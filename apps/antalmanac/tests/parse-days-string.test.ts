import { describe, test, expect } from 'vitest';
import { parseDaysString, SHORT_DAYS } from '$stores/calendarizeHelpers';

describe('parse days string', () => {
    // This is a hardcoded example.
    test('hardcoded one day', () => {
        expect(parseDaysString('Su')).toEqual([0]);
        expect(parseDaysString('M')).toEqual([1]);
        expect(parseDaysString('Tu')).toEqual([2]);
        expect(parseDaysString('W')).toEqual([3]);
        expect(parseDaysString('Th')).toEqual([4]);
        expect(parseDaysString('F')).toEqual([5]);
        expect(parseDaysString('Sa')).toEqual([6]);
    });

    // Same as the one above, but done dynamically.
    // TODO: it might be possible to do all these tests with a single for loop.

    test('one day', () => {
        for (const day of SHORT_DAYS) {
            expect(parseDaysString(day)).toEqual([SHORT_DAYS.indexOf(day)]);
        }
    });

    test('two days', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                expect(parseDaysString(`${day1}${day2}`)).toEqual([SHORT_DAYS.indexOf(day1), SHORT_DAYS.indexOf(day2)]);
            }
        }
    });

    test('three days', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                for (const day3 of SHORT_DAYS) {
                    expect(parseDaysString(`${day1}${day2}${day3}`)).toEqual([
                        SHORT_DAYS.indexOf(day1),
                        SHORT_DAYS.indexOf(day2),
                        SHORT_DAYS.indexOf(day3),
                    ]);
                }
            }
        }
    });

    test('four days', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                for (const day3 of SHORT_DAYS) {
                    for (const day4 of SHORT_DAYS) {
                        expect(parseDaysString(`${day1}${day2}${day3}${day4}`)).toEqual([
                            SHORT_DAYS.indexOf(day1),
                            SHORT_DAYS.indexOf(day2),
                            SHORT_DAYS.indexOf(day3),
                            SHORT_DAYS.indexOf(day4),
                        ]);
                    }
                }
            }
        }
    });

    test('two days scrambled order', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                expect(parseDaysString(`${day2}${day1}`)).toEqual([SHORT_DAYS.indexOf(day2), SHORT_DAYS.indexOf(day1)]);
            }
        }
    });

    test('three days scrambled order', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                for (const day3 of SHORT_DAYS) {
                    expect(parseDaysString(`${day2}${day3}${day1}`)).toEqual([
                        SHORT_DAYS.indexOf(day2),
                        SHORT_DAYS.indexOf(day3),
                        SHORT_DAYS.indexOf(day1),
                    ]);
                }
            }
        }
    });

    test('four days scrambled order', () => {
        for (const day1 of SHORT_DAYS) {
            for (const day2 of SHORT_DAYS) {
                for (const day3 of SHORT_DAYS) {
                    for (const day4 of SHORT_DAYS) {
                        expect(parseDaysString(`${day4}${day3}${day1}${day2}`)).toEqual([
                            SHORT_DAYS.indexOf(day4),
                            SHORT_DAYS.indexOf(day3),
                            SHORT_DAYS.indexOf(day1),
                            SHORT_DAYS.indexOf(day2),
                        ]);
                    }
                }
            }
        }
    });
});
