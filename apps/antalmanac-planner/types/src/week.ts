import { paths } from './generated/anteater-api-types';

export type WeekData = paths['/v2/rest/week']['get']['responses']['200']['content']['application/json']['data'];
