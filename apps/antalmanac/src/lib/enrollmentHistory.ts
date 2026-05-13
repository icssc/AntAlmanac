import type { EnrollmentHistoryEntry } from '@packages/anteater-api/types';

export type EnrollmentHistory = EnrollmentHistoryEntry & {
    days: {
        date: string;
        totalEnrolled: number;
        maxCapacity: number;
        waitlist: number | null;
    }[];
};

// Calendar-year order within a year: Winter < Spring < Summer1 ≈ Summer10wk < Summer2 < Fall
const QUARTER_ORDER = { Winter: 0, Spring: 1, Summer1: 2, Summer10wk: 2, Summer2: 3, Fall: 4 } as const;

export function parseAndSortEnrollmentHistory(res: EnrollmentHistoryEntry[]): EnrollmentHistory[] {
    const parsed: EnrollmentHistory[] = res.map((entry) => ({
        ...entry,
        days: entry.dates.map((dateString, i) => ({
            date: new Date(dateString).toLocaleDateString(),
            totalEnrolled: Number(entry.totalEnrolledHistory[i]),
            maxCapacity: Number(entry.maxCapacityHistory[i]),
            waitlist: entry.waitlistHistory[i] === '-1' ? null : Number(entry.waitlistHistory[i]),
        })),
    }));

    return parsed.sort((a, b) => {
        const yearDiff = Number(b.year) - Number(a.year);

        if (yearDiff !== 0) {
            return yearDiff;
        }

        return QUARTER_ORDER[b.quarter] - QUARTER_ORDER[a.quarter];
    });
}
