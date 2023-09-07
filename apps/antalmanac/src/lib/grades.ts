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
class _Grades {
    gradesCache: Record<string, Grades>;

    // Grades queries that have been cached
    // We need this because gradesCache destructures the data and doesn't retain whether we looked at one course or a whole department/GE
    cachedQueries: Set<string>;

    constructor() {
        this.gradesCache = {};
        this.cachedQueries = new Set<string>();
    }

    clearCache() {
        Object.keys(this.gradesCache).forEach((key) => delete this.gradesCache[key]); //https://stackoverflow.com/a/19316873/14587004
        this.cachedQueries = new Set<string>();
    }

    /*
     * Query the PeterPortal GraphQL API (aggregrateGroupedGrades) for the grades of all course-instructor if not already cached.
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
        if (this.cachedQueries.has(queryKey)) return;

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
            this.gradesCache[cacheKey] = {
                averageGPA: course.averageGPA,
                gradeACount: course.gradeACount,
                gradeBCount: course.gradeBCount,
                gradeCCount: course.gradeCCount,
                gradeDCount: course.gradeDCount,
                gradeFCount: course.gradeFCount,
                gradeNPCount: course.gradeNPCount,
                gradePCount: course.gradePCount,
            };
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
     * @param cacheOnly Whether to only use the cache. If true, will return null if the query is not cached
     *
     * @returns Grades
     */
    queryGrades = async (
        deptCode: string,
        courseNumber: string,
        instructor = '',
        cacheOnly = true
    ): Promise<Grades | null> => {
        instructor = instructor.replace('STAFF', '').trim(); // Ignore STAFF
        const instructorFilter = instructor ? `instructor: "${instructor}"` : '';

        const cacheKey = deptCode + courseNumber + instructor;

        if (cacheKey in this.gradesCache) return this.gradesCache[cacheKey];

        if (cacheOnly) return null;

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

        const resp =
            (await queryGraphQL<GradesGraphQLResponse>(queryString))?.data?.aggregateGrades?.gradeDistribution ?? null;

        if (resp) this.gradesCache[cacheKey] = resp;

        return resp;
    };
}

const grades = new _Grades();
export default grades;
