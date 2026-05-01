import trpc from '$lib/api/trpc';
import type { WebsocSectionType } from '@packages/antalmanac-types';

import { termData } from './termData';

// This represents the enrollment history of a course section during one quarter
export interface EnrollmentHistoryGraphQL {
    year: string;
    quarter: string;
    department: string;
    courseNumber: string;
    sectionCode: string;
    dates: string[];
    totalEnrolledHistory: string[];
    maxCapacityHistory: string[];
    waitlistHistory: string[];
    instructors: string[];
}

export interface EnrollmentHistoryGraphQLResponse {
    data: {
        enrollmentHistory: EnrollmentHistoryGraphQL[];
    };
}

/**
 * To organize the data and make it easier to graph the enrollment
 * data, we can merge the dates, totalEnrolledHistory, maxCapacityHistory,
 * and waitlistHistory arrays into one array that contains the enrollment data
 * for each day
 */
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

export interface EnrollmentHistoryPopoverContext {
    /** Same shape as schedule `term` / `termData` shortName, e.g. `2025 Fall`. */
    termShortName: string;
    sectionCode: string;
    instructors: string[];
}

function instructorOverlap(historyInstructors: string[], currentNames: Set<string>): boolean {
    if (currentNames.size === 0) {
        return true;
    }
    return historyInstructors.some((name) => {
        const t = name.trim();
        return t.length > 0 && t !== 'STAFF' && currentNames.has(t);
    });
}

/** Newest-first among rows matching the schedule term; prefers same section code, then instructor overlap. */
export function findDefaultEnrollmentHistoryIndex(
    history: EnrollmentHistory[],
    context: EnrollmentHistoryPopoverContext
): number {
    if (!history.length) {
        return 0;
    }
    const termParts = context.termShortName.trim().split(/\s+/);
    const year = termParts[0];
    const quarter = termParts.slice(1).join(' ');
    const sectionNorm = context.sectionCode.trim().toUpperCase();
    const currentInstructors = new Set(
        context.instructors.map((n) => n.trim()).filter((n) => n.length > 0 && n !== 'STAFF')
    );

    const newest = history.length - 1;
    for (let i = newest; i >= 0; i--) {
        const h = history[i];
        if (h.year !== year || h.quarter !== quarter) {
            continue;
        }
        if (h.sectionCode.trim().toUpperCase() === sectionNorm) {
            return i;
        }
    }
    for (let i = newest; i >= 0; i--) {
        const h = history[i];
        if (h.year !== year || h.quarter !== quarter) {
            continue;
        }
        if (instructorOverlap(h.instructors, currentInstructors)) {
            return i;
        }
    }
    for (let i = newest; i >= 0; i--) {
        if (history[i].year === year && history[i].quarter === quarter) {
            return i;
        }
    }
    return newest;
}

export class DepartmentEnrollmentHistory {
    static enrollmentHistoryCache: Record<string, EnrollmentHistory[]> = {};
    static termShortNames: string[] = termData.map((term) => term.shortName);

    department: string;

    constructor(department: string) {
        this.department = department;
    }

    async find(courseNumber: string, sectionType: WebsocSectionType): Promise<EnrollmentHistory[]> {
        const cacheKey = `${this.department}-${courseNumber}-${sectionType}`;
        const cacheResult = DepartmentEnrollmentHistory.enrollmentHistoryCache[cacheKey];

        if (cacheResult) {
            return cacheResult;
        }

        const result = await this.queryEnrollmentHistory(courseNumber, sectionType);

        DepartmentEnrollmentHistory.enrollmentHistoryCache[cacheKey] = result;

        return result;
    }

    async queryEnrollmentHistory(courseNumber: string, sectionType: WebsocSectionType): Promise<EnrollmentHistory[]> {
        const res = await trpc.enrollHist.get.query({
            department: this.department,
            courseNumber,
            sectionType,
        });

        if (!res?.length) {
            return [];
        }

        const parsedEnrollmentHistory = DepartmentEnrollmentHistory.parseEnrollmentHistoryResponse(res);
        DepartmentEnrollmentHistory.sortEnrollmentHistory(parsedEnrollmentHistory);
        return parsedEnrollmentHistory;
    }

    /**
     * Parses enrollment history data from Anteater API so that
     * we can pass the data into a recharts graph. For each element in the given
     * array, merge the dates, totalEnrolledHistory, maxCapacityHistory,
     * and waitlistHistory arrays into one array that contains the enrollment data
     * for each day.
     *
     * @param res Array of enrollment histories from Anteater API
     * @returns Array of enrollment histories that we can use for the graph
     */
    static parseEnrollmentHistoryResponse(res: EnrollmentHistoryGraphQL[]): EnrollmentHistory[] {
        const parsedEnrollmentHistory: EnrollmentHistory[] = [];

        for (const enrollmentHistory of res) {
            const enrollmentDays: EnrollmentHistoryDay[] = [];

            for (const [i, dateString] of enrollmentHistory.dates.entries()) {
                const date = new Date(dateString); // dateString is formatted YYYY-MM-DD
                const formattedDateString = date.toLocaleDateString();

                enrollmentDays.push({
                    date: formattedDateString,
                    totalEnrolled: Number(enrollmentHistory.totalEnrolledHistory[i]),
                    maxCapacity: Number(enrollmentHistory.maxCapacityHistory[i]),
                    waitlist:
                        enrollmentHistory.waitlistHistory[i] === '-1'
                            ? null
                            : Number(enrollmentHistory.waitlistHistory[i]),
                });
            }

            parsedEnrollmentHistory.push({
                year: enrollmentHistory.year,
                quarter: enrollmentHistory.quarter,
                department: enrollmentHistory.department,
                courseNumber: enrollmentHistory.courseNumber,
                sectionCode: enrollmentHistory.sectionCode,
                days: enrollmentDays,
                instructors: enrollmentHistory.instructors,
            });
        }

        return parsedEnrollmentHistory;
    }

    /**
     * Sorts the given array of enrollment histories so that
     * the oldest quarters are in the beginning of the array
     *
     * @param enrollmentHistory Array where each element represents the enrollment
     * history of a course section during one quarter
     */
    static sortEnrollmentHistory(enrollmentHistory: EnrollmentHistory[]) {
        enrollmentHistory.sort((a, b) => {
            const aTerm = `${a.year} ${a.quarter}`;
            const bTerm = `${b.year} ${b.quarter}`;
            // If the term for a appears earlier than the term for b in the list of
            // term short names, then a must be the enrollment history for a more recent quarter
            return (
                DepartmentEnrollmentHistory.termShortNames.indexOf(bTerm) -
                DepartmentEnrollmentHistory.termShortNames.indexOf(aTerm)
            );
        });
    }
}
