import { paths } from './generated/anteater-api-types';

export type GradesRaw = paths['/v2/rest/grades/raw']['get']['responses'][200]['content']['application/json']['data'];
