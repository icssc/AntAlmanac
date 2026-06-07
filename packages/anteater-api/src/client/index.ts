import type {
    AggregateGrades,
    AggregateGradesByOffering,
    CalendarAllAPIResult,
    Course,
    CoursesBatchAPIResult,
    CoursesFilteredAPIResult,
    EnrollmentHistory,
    paths,
    WebsocAPIDepartmentsResponse,
    WebsocAPIResponse,
    WebsocSyllabiResponse,
    WebsocTerm,
} from '@packages/anteater-api/types';
import createFetchClient, { type Middleware } from 'openapi-fetch';

export class AAPIError extends Error {
    constructor(
        message: string,
        public readonly status?: number
    ) {
        super(message);
        this.name = 'AAPIError';
    }
}

const BASE_URL = 'https://anteaterapi.com';
const ORIGIN = 'https://antalmanac.com';

export interface AAPIClientOptions {
    apiKey?: string;
}

/** Standard GraphQL HTTP response envelope (`{ data, errors? }`). */
export type GraphQLEnvelope = {
    data: unknown;
};

function isGraphQLEnvelope(value: unknown): value is GraphQLEnvelope {
    return typeof value === 'object' && value !== null && 'data' in value;
}

export function createClient({ apiKey }: AAPIClientOptions = {}) {
    const http = createFetchClient<paths>({ baseUrl: BASE_URL });

    const auth: Middleware = {
        onRequest({ request }) {
            request.headers.set('Origin', ORIGIN);
            if (apiKey) {
                request.headers.set('Authorization', `Bearer ${apiKey}`);
            }

            return request;
        },
    };
    http.use(auth);

    return {
        websoc: {
            async query(
                params: NonNullable<paths['/v2/rest/websoc']['get']['parameters']['query']>
            ): Promise<WebsocAPIResponse> {
                const { data, error, response } = await http.GET('/v2/rest/websoc', {
                    params: { query: params as NonNullable<paths['/v2/rest/websoc']['get']['parameters']['query']> },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async getSyllabi(
                params: NonNullable<paths['/v2/rest/websoc/syllabi']['get']['parameters']['query']>
            ): Promise<WebsocSyllabiResponse> {
                const { data, error, response } = await http.GET('/v2/rest/websoc/syllabi', {
                    params: { query: params },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async getTerms(): Promise<WebsocTerm[]> {
                const { data, error, response } = await http.GET('/v2/rest/websoc/terms', {});
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async getDepartments(
                params?: paths['/v2/rest/websoc/departments']['get']['parameters']['query']
            ): Promise<WebsocAPIDepartmentsResponse> {
                const { data, error, response } = await http.GET('/v2/rest/websoc/departments', {
                    params: { query: params },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },
        },

        courses: {
            async get(id: string): Promise<Course> {
                const { data, error, response } = await http.GET('/v2/rest/courses/{id}', {
                    params: { path: { id } },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async getBatch(ids: string[]): Promise<CoursesBatchAPIResult['data']> {
                const { data, error, response } = await http.GET('/v2/rest/courses/batch', {
                    params: { query: { ids: ids.join(',') } },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async list(
                params: NonNullable<paths['/v2/rest/courses']['get']['parameters']['query']>
            ): Promise<CoursesFilteredAPIResult['data']> {
                const { data, error, response } = await http.GET('/v2/rest/courses', { params: { query: params } });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },
        },

        grades: {
            async aggregate(
                params: paths['/v2/rest/grades/aggregate']['get']['parameters']['query']
            ): Promise<AggregateGrades> {
                const { data, error, response } = await http.GET('/v2/rest/grades/aggregate', {
                    params: { query: params },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },

            async aggregateByOffering(
                params: paths['/v2/rest/grades/aggregateByOffering']['get']['parameters']['query']
            ): Promise<AggregateGradesByOffering> {
                const { data, error, response } = await http.GET('/v2/rest/grades/aggregateByOffering', {
                    params: { query: params },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },
        },

        enrollmentHistory: {
            async get(
                params: paths['/v2/rest/enrollmentHistory']['get']['parameters']['query']
            ): Promise<EnrollmentHistory> {
                const { data, error, response } = await http.GET('/v2/rest/enrollmentHistory', {
                    params: { query: params },
                });
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },
        },

        calendar: {
            async all(): Promise<CalendarAllAPIResult['data']> {
                const { data, error, response } = await http.GET('/v2/rest/calendar/all', {});
                if (error || !data) {
                    throw new AAPIError(error ? JSON.stringify(error) : 'Received empty response', response.status);
                }
                return data.data;
            },
        },

        // GraphQL is not in the OpenAPI spec; implemented with raw fetch
        async graphql(query: string): Promise<GraphQLEnvelope> {
            const res = await fetch(`${BASE_URL}/v2/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Origin: ORIGIN,
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new AAPIError(`GraphQL request failed: ${text}`, res.status);
            }

            const json: unknown = await res.json();

            if (!isGraphQLEnvelope(json)) {
                throw new AAPIError('Invalid GraphQL response', res.status);
            }

            if (json.data === null) {
                throw new AAPIError('GraphQL returned null data', res.status);
            }

            return json;
        },
    };
}

export type AAPIClient = ReturnType<typeof createClient>;
