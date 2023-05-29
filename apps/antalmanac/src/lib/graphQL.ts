import { PETERPORTAL_GRAPHQL_ENDPOINT } from '$lib/api/endpoints';

export interface Grades {
    aCount: number;
    bCount: number;
    cCount: number;
    dCount: number;
    fCount: number;
    pCount: number;
    npCount: number;
    avg: number;
}

interface GradesGraphQLResponse {
    data: {
        courseGrades: {
            aggregate: Grades;
        };
    };
}

export async function queryGraphQL<T>(queryString: string): Promise<T> {
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
    return (await res.json()) as Promise<T>;
}

const gradesCache: Record<string, Grades> = {};

export async function queryGrades(deptCode: string, courseNumber: string) {
    const cacheKey = deptCode + courseNumber;

    if (gradesCache[cacheKey]) {
        return gradesCache[deptCode + courseNumber];
    }

    const queryString = `
      { courseGrades: grades(department: "${deptCode}", number: "${courseNumber}",) {
          aggregate {
            aCount: sum_grade_a_count
            bCount: sum_grade_b_count
            cCount: sum_grade_c_count
            dCount: sum_grade_d_count
            fCount: sum_grade_f_count
            pCount: sum_grade_p_count
            npCount: sum_grade_np_count
            avg: average_gpa
          }
      },
    }`;

    const resp = await queryGraphQL<GradesGraphQLResponse>(queryString);
    const grades = resp.data.courseGrades.aggregate;

    gradesCache[cacheKey] = grades;

    return grades;
}
