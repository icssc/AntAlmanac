import { queryGraphQL } from './helpers';
import { termData } from './termData';

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

// To organize the data and make it easier to graph the enrollment
// data, we can merge the dates, totalEnrolledHistory, maxCapacityHistory,
// and waitlistHistory arrays into one array that contains the enrollment data
// for each day
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

class _EnrollmentHistory {
    // Each key in the cache will be the department, courseNumber, and sectionType
    // concatenated with each other
    enrollmentHistoryCache: Record<string, EnrollmentHistory>;
    termShortNames: string[];

    constructor() {
        this.enrollmentHistoryCache = {};
        this.termShortNames = termData.map((term) => term.shortName);
    }

    queryEnrollmentHistory = async (
        department: string,
        courseNumber: string,
        sectionType: string
    ): Promise<EnrollmentHistory | null> => {
        const cacheKey = department + courseNumber + sectionType;
        if (cacheKey in this.enrollmentHistoryCache) {
            return this.enrollmentHistoryCache[cacheKey];
        }

        const queryString = `{
            enrollmentHistory(department: "${department}", courseNumber: "${courseNumber}", sectionType: ${sectionType}) {
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

        const res =
            (await queryGraphQL<EnrollmentHistoryGraphQLResponse>(queryString))?.data?.enrollmentHistory ?? null;

        if (res) {
            // Before caching and returning the response, we need to do
            // some parsing so that we can pass the data into the graph
            const parsedEnrollmentHistory = this.parseEnrollmentHistoryResponse(res);

            // Sort the enrollment history so that the most recent quarters are
            // in the beginning of the array
            this.sortEnrollmentHistory(parsedEnrollmentHistory);

            // For now, just return the enrollment history of the most recent quarter
            // instead of the entire array of enrollment histories
            const latestEnrollmentHistory = parsedEnrollmentHistory[0];
            this.enrollmentHistoryCache[cacheKey] = latestEnrollmentHistory;
            return latestEnrollmentHistory;
        }

        return null;
    };

    parseEnrollmentHistoryResponse = (res: EnrollmentHistoryGraphQL[]): EnrollmentHistory[] => {
        const parsedEnrollmentHistory: EnrollmentHistory[] = [];

        if (res) {
            for (const enrollmentHistory of res) {
                const enrollmentDays: EnrollmentHistoryDay[] = [];

                for (const [i, date] of enrollmentHistory.dates.entries()) {
                    const d = new Date(date);
                    const formattedDate = `${d.getMonth() + 1}/${d.getDate() + 1}/${d.getFullYear()}`;

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
        }

        return parsedEnrollmentHistory;
    };

    sortEnrollmentHistory = (enrollmentHistory: EnrollmentHistory[]) => {
        enrollmentHistory.sort((a, b) => {
            const aTerm = `${a.year} ${a.quarter}`;
            const bTerm = `${b.year} ${b.quarter}`;
            // If the term for a appears earlier than the term for b in the list of
            // term short names, then a must be the enrollment history for a later quarter
            return this.termShortNames.indexOf(aTerm) - this.termShortNames.indexOf(bTerm);
        });
    };
}

const enrollmentHistory = new _EnrollmentHistory();
export default enrollmentHistory;
