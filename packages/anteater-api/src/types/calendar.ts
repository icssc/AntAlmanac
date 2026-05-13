import { paths } from './generated/anteater-api-types';

export type CalendarAllAPIResult =
    paths['/v2/rest/calendar/all']['get']['responses'][200]['content']['application/json'];

export type CalendarTerm = paths['/v2/rest/calendar']['get']['responses'][200]['content']['application/json']['data'];
