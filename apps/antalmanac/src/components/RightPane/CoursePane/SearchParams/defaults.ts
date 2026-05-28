import { getDefaultTerm } from '$lib/term';
import { WebsocDivisionOptionSchema, WebsocFullCoursesOptionSchema, WebsocGeSchema } from '@packages/antalmanac-types';

export const DEFAULT_TERM = getDefaultTerm();

export const DEFAULT_MANUAL_SEARCH_VALUES = {
    deptValue: 'ALL',
    ge: [WebsocGeSchema.enum.ANY],
    courseNumber: '',
    sectionCode: '',
} as const;

export const DEFAULT_ADVANCED_SEARCH_VALUES = {
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    fullCourses: WebsocFullCoursesOptionSchema.enum.ANY,
    building: '',
    room: '',
    division: WebsocDivisionOptionSchema.enum.ANY,
    excludeRoadmapCourses: '',
    excludeRestrictionCodes: '',
    days: '',
} as const;

export const DEFAULT_FORM_DATA = {
    term: DEFAULT_TERM,
    ...DEFAULT_MANUAL_SEARCH_VALUES,
    ...DEFAULT_ADVANCED_SEARCH_VALUES,
} as const;
