import { ANY_GE } from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/term';
import {
    WebsocDayOptionSchema,
    WebsocDivisionOptionSchema,
    WebsocFullCoursesOptionSchema,
    WebsocRestrictionCodeOptionSchema,
} from '@packages/antalmanac-types';

export const DEFAULT_TERM = getDefaultTerm();

export const DEFAULT_MANUAL_SEARCH_VALUES = {
    deptValue: 'ALL',
    ge: ANY_GE,
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
    excludeRestrictionCodes: [] satisfies (typeof WebsocRestrictionCodeOptionSchema.options)[number][],
    days: [] satisfies (typeof WebsocDayOptionSchema.options)[number][],
    courseIds: [] as string[],
};

export const DEFAULT_FORM_DATA = {
    term: DEFAULT_TERM,
    ...DEFAULT_MANUAL_SEARCH_VALUES,
    ...DEFAULT_ADVANCED_SEARCH_VALUES,
} as const;
