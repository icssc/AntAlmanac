import { PETERPORTAL_GRAPHQL_ENDPOINT } from '$lib/api/endpoints';

export interface Grades {
    a: number;
    b: number;
    c: number;
    d: number;
    f: number;
    p: number;
    np: number;
    avg: number;
}

interface GradesGraphQLResponse {
    data: {
        courseGrades: {
            aggregate: Grades;
        };
    };
}

export async function queryGraphQL<ResponseT>(queryString: string): Promise<ResponseT> {
    const query = JSON.stringify({
        query: queryString,
    });

    const res = await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: query,
    });
    return (await res.json()) as Promise<ResponseT>;
}

const gradesCache: Record<string, Grades> = {};

/*
 * Query the PeterPortal GraphQL API for a course's grades with caching
 *
 * @param deptCode The department code of the course.
 * @param courseNumber The course number of the course.
 * @param instructor The instructor's name (optional)
 *
 * @returns Grades
 */
export async function queryGrades(deptCode: string, courseNumber: string, instructor = '') {
    instructor = instructor.replace('STAFF', '').trim();

    const cacheKey = deptCode + courseNumber + instructor;

    if (gradesCache[cacheKey]) {
        return gradesCache[cacheKey];
    }

    const queryString = `
      { courseGrades: grades(department: "${deptCode}", number: "${courseNumber}",) {
          aggregate {
            a: sum_grade_a_count
            b: sum_grade_b_count
            c: sum_grade_c_count
            d: sum_grade_d_count
            f: sum_grade_f_count
            p: sum_grade_p_count
            np: sum_grade_np_count
            avg: average_gpa
          }
      },
    }`;

    const resp = await queryGraphQL<GradesGraphQLResponse>(queryString);
    const grades = resp.data.courseGrades.aggregate;

    gradesCache[cacheKey] = grades;

    return grades;
}
