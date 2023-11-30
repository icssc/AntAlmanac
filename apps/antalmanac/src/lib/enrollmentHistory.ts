import { queryGraphQL } from './helpers';

export interface EnrollmentHistoryGraphQL {
    year: string;
    quarter: string;
    department: string;
    courseNumber: string;
    dates: string[];
    totalEnrolledHistory: string[];
    maxCapacityHistory: string[];
    waitlistHistory: string[];
}

export interface EnrollmentHistoryGraphQLResponse {
    data: {
        enrollmentHistory: EnrollmentHistoryGraphQL[];
    };
}

// To organize the data and make it easier to graph the enrollment
// data, we can merge the dates, total enrolled, max capacity,
// and waitlist data into one array that contains the enrollment data
// for each day
export interface EnrollmentHistory {
    year: string;
    quarter: string;
    department: string;
    courseNumber: string;
    days: EnrollmentHistoryDay[];
}

export interface EnrollmentHistoryDay {
    date: string;
    totalEnrolled: number;
    maxCapacity: number;
    waitlist: number | null;
}

export const queryEnrollmentHistory = async (
    department: string,
    courseNumber: string,
    sectionType: string
): Promise<EnrollmentHistory[] | null> => {
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
        }
    }`;

    const res = (await queryGraphQL<EnrollmentHistoryGraphQLResponse>(queryString))?.data?.enrollmentHistory ?? null;

    const enrollmentHistories: EnrollmentHistory[] = [];
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

            enrollmentHistories.push({
                year: enrollmentHistory.year,
                quarter: enrollmentHistory.quarter,
                department: enrollmentHistory.department,
                courseNumber: enrollmentHistory.courseNumber,
                days: enrollmentDays,
            });
        }
    }

    return enrollmentHistories;
};
