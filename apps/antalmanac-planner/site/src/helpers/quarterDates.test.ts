import { getTermMismatch, isUpcomingQuarter, quarterCalendarYear } from './quarterDates';

const nov2026 = new Date(2026, 10, 19);

it('treats quarters that already ended as not upcoming', () => {
    for (const quarter of ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2']) {
        expect(isUpcomingQuarter(2025, quarter, nov2026)).toBe(false);
    }
});

it('treats the quarter in progress as not upcoming, and later quarters as upcoming', () => {
    expect(isUpcomingQuarter(2026, 'Fall', nov2026)).toBe(false);
    expect(isUpcomingQuarter(2026, 'Winter', nov2026)).toBe(true);
    expect(isUpcomingQuarter(2026, 'Spring', nov2026)).toBe(true);
    expect(isUpcomingQuarter(2026, 'Summer1', nov2026)).toBe(true);
    expect(isUpcomingQuarter(2027, 'Fall', nov2026)).toBe(true);
});

it('uses the academic year, so Winter 2027 belongs to the 2026-27 year', () => {
    expect(quarterCalendarYear(2026, 'Fall')).toBe(2026);
    expect(quarterCalendarYear(2026, 'Winter')).toBe(2027);
    expect(isUpcomingQuarter(2026, 'Winter', new Date(2027, 0, 4))).toBe(true);
    expect(isUpcomingQuarter(2026, 'Winter', new Date(2027, 0, 6))).toBe(false);
});

it('prefers the official instruction start over the approximation', () => {
    // Fall 2026 instruction starts 2026-09-24; the approximation would be the same day, so move "now" between them
    expect(isUpcomingQuarter(2026, 'Fall', new Date(2026, 8, 22), '2026-09-24')).toBe(true);
    expect(isUpcomingQuarter(2026, 'Fall', new Date(2026, 8, 25), '2026-09-24')).toBe(false);
    // An official date overrides the approximation in either direction
    expect(isUpcomingQuarter(2026, 'Winter', new Date(2027, 0, 5), '2027-01-11')).toBe(true);
});

it('falls back to the approximation when the official date is missing or malformed', () => {
    expect(isUpcomingQuarter(2025, 'Fall', nov2026, null)).toBe(false);
    expect(isUpcomingQuarter(2025, 'Fall', nov2026, 'not a date')).toBe(false);
    expect(isUpcomingQuarter(2027, 'Fall', nov2026, null)).toBe(true);
});

it('treats unknown quarter names as upcoming', () => {
    expect(isUpcomingQuarter(2020, 'Mystery', nov2026)).toBe(true);
});

describe('getTermMismatch', () => {
    it('is undefined when offered in this quarter within the last few years', () => {
        expect(getTermMismatch(['2025 Winter', '2024 Fall'], 'Winter', 2026, nov2026)).toBeUndefined();
    });

    it('names the quarter when offered recently, but not in this quarter', () => {
        expect(getTermMismatch(['2025 Fall', '2025 Spring'], 'Winter', 2026, nov2026)).toBe('Winter');
    });

    it('reports RecentYears when not offered in any recent year', () => {
        expect(getTermMismatch(['2018 Fall'], 'Winter', 2026, nov2026)).toBe('RecentYears');
    });
});
