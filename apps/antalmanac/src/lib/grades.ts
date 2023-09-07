import { GE } from 'peterportal-api-next-types';
import { queryGraphQL } from './helpers';

export interface Grades {
    averageGPA: number;
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    gradeDCount: number;
    gradeFCount: number;
    gradePCount: number;
    gradeNPCount: number;
}

export interface CourseInstructorGrades extends Grades {
    department: string;
    courseNumber: string;
    instructor: string;
}

export interface GradesGraphQLResponse {
    data: {
        aggregateGrades: {
            gradeDistribution: Grades;
        };
    };
}

export interface GroupedGradesGraphQLResponse {
    data: {
        aggregateGroupedGrades: Array<CourseInstructorGrades>;
    };
}

/**
 * Class to handle querying and caching of grades.
 * Retrieves grades from the PeterPortal GraphQL API.
 */
export class _Grades {
    // null means that the request failed
    // undefined means that the request is in progress
    gradesCache: { [key: string]: Grades | null | undefined } = {};

    // Grades queries that have been cached
    // We need this because gradesCache destructures the data and doesn't retain whether we looked at one course or a whole department/GE
    cachedQueries = new Set<string>();

    clearCache() {
        Object.keys(this.gradesCache).forEach((key) => delete this.gradesCache[key]); //https://stackoverflow.com/a/19316873/14587004
        this.cachedQueries = new Set<string>();
    }

    /*
     * Query the PeterPortal GraphQL API (aggregrateGroupedGrades) for the grades of all course-instructor.
     * This should be done before queryGrades to avoid DoS'ing the server
     *
     * Either department or ge must be provided
     *
     * @param department The department code of the course.
     * @param courseNumber The course number of the course.
     * @param ge The GE filter
     */
    populateGradesCache = async ({ department, ge }: { department?: string; ge?: GE }): Promise<void> => {
        if (!department && !ge) throw new Error('populategradesCache: Must provide either department or ge');

        const queryKey = `${department ?? ''}${ge ?? ''}`;

        // If the whole query has already been cached, return
        if (queryKey in this.cachedQueries) return;

        const filter = `${ge ? `ge: ${ge} ` : ''}${department ? `department: "${department}" ` : ''}`;

        const response = await queryGraphQL<GroupedGradesGraphQLResponse>(`{
            aggregateGroupedGrades(${filter}) {
                department
                courseNumber
                instructor
                averageGPA
                gradeACount
                gradeBCount
                gradeCCount
                gradeDCount
                gradeFCount
                gradeNPCount
                gradePCount
            }
        }`);

        const groupedGrades = response?.data?.aggregateGroupedGrades;

        if (!groupedGrades) throw new Error('populateGradesCache: Failed to query GraphQL');

        // Populate cache
        for (const course of groupedGrades) {
            const cacheKey = `${course.department}${course.courseNumber}${course.instructor}`;
            this.gradesCache[cacheKey] = course as Grades;
        }

        this.cachedQueries.add(queryKey);
    };

    /*
     * Query the PeterPortal GraphQL API for a course's grades with caching
     * This should NOT be done individually and independantly to fetch large amounts of data. Use populateGradesCache first to avoid DoS'ing the server
     *
     * @param deptCode The department code of the course.
     * @param courseNumber The course number of the course.
     * @param instructor The instructor's name (optional)
     *
     * @returns Grades
     */
    queryGrades = async (deptCode: string, courseNumber: string, instructor = ''): Promise<Grades | null> => {
        instructor = instructor.replace('STAFF', '').trim(); // Ignore STAFF
        const instructorFilter = instructor ? `instructor: "${instructor}"` : '';

        const cacheKey = deptCode + courseNumber + instructor;

        // If cache is null, that request failed last time, and we try again
        if (cacheKey in this.gradesCache && this.gradesCache[cacheKey] !== null) {
            // If cache is undefined, there's a request in progress
            while (this.gradesCache[cacheKey] === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 350)); // Wait before checking cache again
            }
            return this.gradesCache[cacheKey] as Grades;
        }

        this.gradesCache[cacheKey] = undefined; // Set cache to undefined to indicate request in progress

        const queryString = `{ 
            aggregateGrades(department: "${deptCode}", courseNumber: "${courseNumber}", ${instructorFilter}) {
                gradeDistribution {
                    gradeACount
                    gradeBCount
                    gradeCCount
                    gradeDCount
                    gradeFCount
                    gradePCount
                    gradeNPCount
                    averageGPA
                }
            },
        }`;

        const resp = await queryGraphQL<GradesGraphQLResponse>(queryString);
        this.gradesCache[cacheKey] = resp?.data?.aggregateGrades?.gradeDistribution;

        return this.gradesCache[cacheKey] as Grades;
    };
}

export default new _Grades();
