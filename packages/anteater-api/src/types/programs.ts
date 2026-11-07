import type { paths } from './generated/anteater-api-types';

export type MajorsAPIResult = paths['/v2/rest/programs/majors']['get']['responses'][200]['content']['application/json'];

export type MajorsAPIResponse = MajorsAPIResult['data'];
