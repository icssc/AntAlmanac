import type { AATerm } from '@packages/antalmanac-types';
import type { EnrollmentHistoryEntry } from '@packages/anteater-api/types';

import { getTermByYearAndQuarter, termData } from './term';

export interface EnrollmentHistory {
    term: AATerm;
    department: EnrollmentHistoryEntry['department'];
    courseNumber: EnrollmentHistoryEntry['courseNumber'];
    sectionCode: EnrollmentHistoryEntry['sectionCode'];
    days: EnrollmentHistoryDay[];
    instructors: EnrollmentHistoryEntry['instructors'];
}

export interface EnrollmentHistoryDay {
    date: string;
    totalEnrolled: number;
    maxCapacity: number;
    waitlist: number | null;
}

const termShortNames = termData.map((term) => term.shortName);

export function parseAndSortEnrollmentHistory(res: EnrollmentHistoryEntry[]): EnrollmentHistory[] {
    const parsed: EnrollmentHistory[] = res.flatMap((entry) => {
        const term = getTermByYearAndQuarter(entry.year, entry.quarter);
        if (!term) {
            return [];
        }

        return {
            term,
            department: entry.department,
            courseNumber: entry.courseNumber,
            sectionCode: entry.sectionCode,
            instructors: entry.instructors,
            days: entry.dates.map((dateString, i) => ({
                date: new Date(dateString).toLocaleDateString(),
                totalEnrolled: Number(entry.totalEnrolledHistory[i]),
                maxCapacity: Number(entry.maxCapacityHistory[i]),
                waitlist: entry.waitlistHistory[i] === '-1' ? null : Number(entry.waitlistHistory[i]),
            })),
        };
    });

    return parsed.sort((a, b) => {
        return termShortNames.indexOf(b.term.shortName) - termShortNames.indexOf(a.term.shortName);
    });
}
