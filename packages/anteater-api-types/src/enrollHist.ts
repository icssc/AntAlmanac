import { paths } from './generated/anteater-api-types';

export type EnrollmentHistory =
    paths['/v2/rest/enrollmentHistory']['get']['responses'][200]['content']['application/json']['data'];
