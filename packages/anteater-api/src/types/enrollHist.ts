import { paths } from './generated/anteater-api-types';

export type EnrollmentHistoryAPIResult =
    paths['/v2/rest/enrollmentHistory']['get']['responses'][200]['content']['application/json'];

export type EnrollmentHistory = EnrollmentHistoryAPIResult['data'];
