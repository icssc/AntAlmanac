import type { EnrollmentHistoryEntry } from '@packages/anteater-api/types';

import { termData } from './termData';

export interface EnrollmentHistory {
    year: string;
    quarter: string;
    department: string;
    courseNumber: string;
    sectionCode: string;
    days: EnrollmentHistoryDay[];
    instructors: string[];
}

export interface EnrollmentHistoryDay {
    date: string;
    totalEnrolled: number;
    maxCapacity: number;
    waitlist: number | null;
}

const termShortNames = termData.map((term) => term.shortName);

export function parseAndSortEnrollmentHistory(res: EnrollmentHistoryEntry[]): EnrollmentHistory[] {
    const parsed: EnrollmentHistory[] = res.map((entry) => ({
        year: entry.year,
        quarter: entry.quarter,
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
    }));

    type ShortName = (typeof termShortNames)[number];
    return parsed.sort((a, b) => {
        const aTerm = `${a.year} ${a.quarter}` as ShortName;
        const bTerm = `${b.year} ${b.quarter}` as ShortName;
        return termShortNames.indexOf(bTerm) - termShortNames.indexOf(aTerm);
    });
}
