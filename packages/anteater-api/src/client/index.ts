import createFetchClient, { type Middleware } from 'openapi-fetch';

import type { paths } from '../types/generated/anteater-api-types';
import type {
    AggregateGrades,
    AggregateGradesByOffering,
    CalendarAllAPIResult,
    Course,
    CoursesBatchAPIResult,
    CoursesFilteredAPIResult,
    EnrollmentHistory,
    WebsocAPIDepartmentsResponse,
    WebsocAPIResponse,
    WebsocSyllabiResponse,
    WebsocTerm,
} from '../types/index';

const BASE_URL = 'https://anteaterapi.com';

export type AAPIClientOptions = { apiKey?: string };

export function createClient({ apiKey }: AAPIClientOptions = {}) {
    const http = createFetchClient<paths>({ baseUrl: BASE_URL });

    if (apiKey) {
        const auth: Middleware = {
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${apiKey}`);
                return request;
            },
        };
        http.use(auth);
    }

    return {
        websoc: {
            async query(
                params: NonNullable<paths['/v2/rest/websoc']['get']['parameters']['query']>
            ): Promise<WebsocAPIResponse> {
                const { data, error } = await http.GET('/v2/rest/websoc', { params: { query: params } });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async getSyllabi(
                params: NonNullable<paths['/v2/rest/websoc/syllabi']['get']['parameters']['query']>
            ): Promise<WebsocSyllabiResponse> {
                const { data, error } = await http.GET('/v2/rest/websoc/syllabi', { params: { query: params } });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async getTerms(): Promise<WebsocTerm[]> {
                const { data, error } = await http.GET('/v2/rest/websoc/terms', {});
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async getDepartments(
                params?: paths['/v2/rest/websoc/departments']['get']['parameters']['query']
            ): Promise<WebsocAPIDepartmentsResponse> {
                const { data, error } = await http.GET('/v2/rest/websoc/departments', {
                    params: { query: params },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },
        },

        courses: {
            async get(id: string): Promise<Course> {
                const { data, error } = await http.GET('/v2/rest/courses/{id}', {
                    params: { path: { id } },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async getBatch(ids: string[]): Promise<CoursesBatchAPIResult['data']> {
                const { data, error } = await http.GET('/v2/rest/courses/batch', {
                    params: { query: { ids: ids.join(',') } },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async list(
                params: NonNullable<paths['/v2/rest/courses']['get']['parameters']['query']>
            ): Promise<CoursesFilteredAPIResult['data']> {
                const { data, error } = await http.GET('/v2/rest/courses', { params: { query: params } });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },
        },

        grades: {
            async aggregate(
                params: paths['/v2/rest/grades/aggregate']['get']['parameters']['query']
            ): Promise<AggregateGrades> {
                const { data, error } = await http.GET('/v2/rest/grades/aggregate', {
                    params: { query: params },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },

            async aggregateByOffering(
                params: paths['/v2/rest/grades/aggregateByOffering']['get']['parameters']['query']
            ): Promise<AggregateGradesByOffering> {
                const { data, error } = await http.GET('/v2/rest/grades/aggregateByOffering', {
                    params: { query: params },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },
        },

        enrollmentHistory: {
            async get(
                params: paths['/v2/rest/enrollmentHistory']['get']['parameters']['query']
            ): Promise<EnrollmentHistory> {
                const { data, error } = await http.GET('/v2/rest/enrollmentHistory', {
                    params: { query: params },
                });
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },
        },

        calendar: {
            async all(): Promise<CalendarAllAPIResult['data']> {
                const { data, error } = await http.GET('/v2/rest/calendar/all', {});
                if (error || !data) throw new Error(`Anteater API error: ${JSON.stringify(error)}`);
                return data.data;
            },
        },

        // GraphQL is not in the OpenAPI spec; implemented with raw fetch
        async graphql<T>(query: string): Promise<T | null> {
            try {
                const res = await fetch(`${BASE_URL}/v2/graphql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                    },
                    body: JSON.stringify({ query }),
                });
                const json = await res.json();
                if (!res.ok || json.data === null) return null;
                return json as T;
            } catch {
                return null;
            }
        },
    };
}

export type AAPIClient = ReturnType<typeof createClient>;
