import type { QuarterName } from '@peterportal/types';

/**
 * Approximate first day of each quarter, as [month (0-indexed), day, year offset from the academic year's start year].
 * Only a fallback for terms the Anteater API calendar doesn't cover yet; precise enough to tell upcoming quarters
 * from past ones.
 */
const quarterStarts: Record<string, [number, number, number]> = {
    Fall: [8, 24, 0],
    Winter: [0, 5, 1],
    Spring: [2, 28, 1],
    Summer1: [5, 20, 1],
    Summer10wk: [5, 20, 1],
    Summer2: [7, 1, 1],
};

/** The calendar year a quarter of the academic year starting in `startYear` falls in */
export const quarterCalendarYear = (startYear: number, quarterName: string) =>
    quarterName === 'Fall' ? startYear : startYear + 1;

/** Parses a YYYY-MM-DD date as the start of that day in local time */
function parseDay(day: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/**
 * Whether a quarter in the academic year starting in `startYear` has not started yet. Quarters that are in progress
 * or already finished are not upcoming. Uses the official instruction start (YYYY-MM-DD) when given, otherwise an
 * approximation. Unknown quarter names are treated as upcoming.
 */
export function isUpcomingQuarter(
    startYear: number,
    quarterName: string,
    now: Date = new Date(),
    instructionStart?: string | null
): boolean {
    const official = instructionStart ? parseDay(instructionStart) : null;
    if (official) return now < official;
    const start = quarterStarts[quarterName];
    if (!start) return true;
    const [month, day, yearOffset] = start;
    return now < new Date(startYear + yearOffset, month, day);
}

const searchPrevYears = 2;

/**
 * Whether a course was not offered in this quarter during the last few years: 'RecentYears' if it hasn't been offered
 * in any quarter recently, the quarter name if it just wasn't offered in this one, or undefined if it was.
 */
export function getTermMismatch(
    terms: string[],
    quarterName: QuarterName,
    startYear: number,
    now: Date = new Date()
): QuarterName | 'RecentYears' | undefined {
    const currentStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const useYear = Math.min(currentStartYear, startYear);
    const termYear = quarterName === 'Fall' ? useYear : useYear + 1;
    for (let i = 0; i <= searchPrevYears; i++) {
        if (terms.includes(`${termYear - i} ${quarterName}`)) return undefined;
    }
    const offeredRecently = terms.some((term) => {
        for (let i = 0; i <= searchPrevYears; i++) {
            if (term.startsWith(`${termYear - i} `)) return true;
        }
        return false;
    });
    return offeredRecently ? quarterName : 'RecentYears';
}
