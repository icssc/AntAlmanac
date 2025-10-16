import { paths } from './generated/anteater-api-types';

export type LarcAPIResponse = paths['/v2/rest/larc']['get']['responses'][200]['content']['application/json']['data'];
