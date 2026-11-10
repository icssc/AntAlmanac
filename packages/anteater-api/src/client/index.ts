import {
    type AggregateGradesByOfferingData,
    type AggregateGradesData,
    type CoursesByFiltersData,
    type EnrollmentHistoryData,
    type WebsocData,
    type WebsocDepartmentsData,
    type WebsocSyllabiData,
    aggregateGrades,
    aggregateGradesByOffering,
    allCalendarTerms,
    batchCourses,
    courseById,
    coursesByFilters,
    enrollmentHistory,
    websoc,
    websocDepartments,
    websocSyllabi,
    websocTerms,
} from '$generated/anteater-api-types';
import { client } from '$generated/anteater-api-types/client.gen';
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
} from '@packages/anteater-api/types';

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

function getAapiError(error: { message: string }, response: Response | undefined) {
    return new AAPIError(error.message ? JSON.stringify(error.message) : 'Received empty response', response?.status);
}

export function createClient({ apiKey }: AAPIClientOptions = {}) {
    client.interceptors.request.use((request) => {
        request.headers.set('Origin', ORIGIN);
        if (apiKey) {
            request.headers.set('Authorization', `Bearer ${apiKey}`);
        }
    });

    return {
        websoc: {
            async query(params: WebsocData['query']): Promise<WebsocAPIResponse> {
                const { data, error, response } = await websoc({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async getSyllabi(params: WebsocSyllabiData['query']): Promise<WebsocSyllabiResponse> {
                const { data, error, response } = await websocSyllabi({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async getTerms(): Promise<WebsocTerm[]> {
                const { data, error, response } = await websocTerms();
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async getDepartments(params?: WebsocDepartmentsData['query']): Promise<WebsocAPIDepartmentsResponse> {
                const { data, error, response } = await websocDepartments({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },
        },

        courses: {
            async get(id: string): Promise<Course> {
                const { data, error, response } = await courseById({ path: { id } });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async getBatch(ids: string[]): Promise<CoursesBatchAPIResult['data']> {
                const { data, error, response } = await batchCourses({ query: { ids: ids.join(',') } });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async list(params: NonNullable<CoursesByFiltersData['query']>): Promise<CoursesFilteredAPIResult['data']> {
                const { data, error, response } = await coursesByFilters({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },
        },

        grades: {
            async aggregate(params: AggregateGradesData['query']): Promise<AggregateGrades> {
                const { data, error, response } = await aggregateGrades({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },

            async aggregateByOffering(
                params: AggregateGradesByOfferingData['query']
            ): Promise<AggregateGradesByOffering> {
                const { data, error, response } = await aggregateGradesByOffering({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },
        },

        enrollmentHistory: {
            async get(params: EnrollmentHistoryData['query']): Promise<EnrollmentHistory> {
                const { data, error, response } = await enrollmentHistory({ query: params });
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },
        },

        calendar: {
            async all(): Promise<CalendarAllAPIResult['data']> {
                const { data, error, response } = await allCalendarTerms();
                if (error || !data) {
                    throw getAapiError(error, response);
                }
                return data.data;
            },
        },

        // GraphQL is not in the OpenAPI spec; implemented with raw fetch
        async graphql<T>(query: string): Promise<T> {
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

            return (await res.json()) as T;
        },
    };
}

export type AAPIClient = ReturnType<typeof createClient>;
