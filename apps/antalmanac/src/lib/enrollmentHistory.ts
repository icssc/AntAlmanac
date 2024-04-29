import { queryGraphQL } from './helpers';
import { termData } from './termData';

// This represents the enrollment history of a course section during one quarter
export interface EnrollmentHistoryGraphQL {
    year: string;
    quarter: string;
    department: string;
    courseNumber: string;
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
    days: EnrollmentHistoryDay[];
    instructors: string[];
}

export interface EnrollmentHistoryDay {
    date: string;
    totalEnrolled: number;
    maxCapacity: number;
    waitlist: number | null;
}

export class DepartmentEnrollmentHistory {
    // Each key in the cache will be the department and courseNumber concatenated
    static enrollmentHistoryCache: Record<string, EnrollmentHistory[] | null> = {};
    static termShortNames: string[] = termData.map((term) => term.shortName);
    static QUERY_TEMPLATE = `{
        enrollmentHistory(department: "$$DEPARTMENT$$", courseNumber: "$$COURSE_NUMBER$$", sectionType: Lec) {
            year
            quarter
            department
            courseNumber
            dates
            totalEnrolledHistory
            maxCapacityHistory
            waitlistHistory
            instructors
        }
    }`;

    department: string;
    partialQueryString: string;

    constructor(department: string) {
        this.department = department;
        this.partialQueryString = DepartmentEnrollmentHistory.QUERY_TEMPLATE.replace('$$DEPARTMENT$$', department);
    }

    async find(courseNumber: string): Promise<EnrollmentHistory[] | null> {
        const cacheKey = this.department + courseNumber;
        return (DepartmentEnrollmentHistory.enrollmentHistoryCache[cacheKey] ??=
            await this.queryEnrollmentHistory(courseNumber));
    }

    async queryEnrollmentHistory(courseNumber: string): Promise<EnrollmentHistory[] | null> {
        // Query for the enrollment history of all lecture sections that were offered
        const queryString = this.partialQueryString.replace('$$COURSE_NUMBER$$', courseNumber);

        const res = (await queryGraphQL<EnrollmentHistoryGraphQLResponse>(queryString))?.data?.enrollmentHistory;

        if (!res?.length) {
            return null;
        }

        const parsedEnrollmentHistory = DepartmentEnrollmentHistory.parseEnrollmentHistoryResponse(res);
        DepartmentEnrollmentHistory.sortEnrollmentHistory(parsedEnrollmentHistory);
        return parsedEnrollmentHistory;
    }

    /**
     * Parses enrollment history data from PeterPortal so that
     * we can pass the data into a recharts graph. For each element in the given
     * array, merge the dates, totalEnrolledHistory, maxCapacityHistory,
     * and waitlistHistory arrays into one array that contains the enrollment data
     * for each day.
     *
     * @param res Array of enrollment histories from PeterPortal
     * @returns Array of enrollment histories that we can use for the graph
     */
    static parseEnrollmentHistoryResponse(res: EnrollmentHistoryGraphQL[]): EnrollmentHistory[] {
        const parsedEnrollmentHistory: EnrollmentHistory[] = [];

        for (const enrollmentHistory of res) {
            const enrollmentDays: EnrollmentHistoryDay[] = [];

            for (const [i, date] of enrollmentHistory.dates.entries()) {
                const d = new Date(date);
                const formattedDate = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

                enrollmentDays.push({
                    date: formattedDate,
                    totalEnrolled: Number(enrollmentHistory.totalEnrolledHistory[i]),
                    maxCapacity: Number(enrollmentHistory.maxCapacityHistory[i]),
                    waitlist:
                        enrollmentHistory.waitlistHistory[i] === 'n/a'
                            ? null
                            : Number(enrollmentHistory.waitlistHistory[i]),
                });
            }

            parsedEnrollmentHistory.push({
                year: enrollmentHistory.year,
                quarter: enrollmentHistory.quarter,
                department: enrollmentHistory.department,
                courseNumber: enrollmentHistory.courseNumber,
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
