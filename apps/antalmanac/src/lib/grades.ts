import { GE } from '@packages/antalmanac-types';

import trpc from '$lib/api/trpc';

export interface GradesProps {
    averageGPA: number | null;
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    gradeDCount: number;
    gradeFCount: number;
    gradePCount: number;
    gradeNPCount: number;
}

/**
 * Class to handle querying and caching of grades.
 * Retrieves grades from Anteater API.
 */
class _Grades {
    gradesCache: Record<string, GradesProps>;

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
     * Query the Anteater API for the grades of all course-instructor if not already cached.
     * This should be done before queryGrades to avoid DoS'ing the server
     *
     * Either department or ge must be provided
     *
     * @param department The department code of the course.
     * @param courseNumber The course number of the course.
     * @param ge The GE filter
     */
    populateGradesCache = async ({ department, ge }: { department?: string; ge?: GE }): Promise<void> => {
        department = department != 'ALL' ? department : undefined;
        ge = ge != 'ANY' ? ge : undefined;

        if (!department && !ge) throw new Error('populateGradesCache: Must provide either department or ge');

        const queryKey = `${department ?? ''}${ge ?? ''}`;

        // If the whole query has already been cached, return
        if (this.cachedQueries.has(queryKey)) return;

        const groupedGrades = await trpc.grades.aggregateByOffering.mutate({ department, ge });

        if (!groupedGrades) throw new Error('populateGradesCache: Failed to query grades');

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
     * Query the AnteaterAPI API for a course's grades with caching
     * This should NOT be done individually and independently to fetch large amounts of data. Use populateGradesCache first to avoid DoS'ing the server
     *
     * @param deptCode The department code of the course.
     * @param courseNumber The course number of the course.
     * @param instructor The instructor's name (optional)
     * @param cacheOnly Whether to only use the cache. If true, will return null if the query is not cached
     *
     * @returns Grades
     */
    queryGrades = async (
        department: string,
        courseNumber: string,
        instructor = '',
        cacheOnly = true
    ): Promise<GradesProps | null> => {
        instructor = instructor.replace('STAFF', '').trim(); // Ignore STAFF

        const cacheKey = department + courseNumber + instructor;

        if (cacheKey in this.gradesCache) return this.gradesCache[cacheKey];

        if (cacheOnly) return null;

        const resp = await trpc.grades.aggregateGrades
            .query({ department, courseNumber, instructor })
            .then((x) => x?.gradeDistribution ?? null);

        if (resp) this.gradesCache[cacheKey] = resp;

        return resp;
    };
}

export const Grades = new _Grades();
