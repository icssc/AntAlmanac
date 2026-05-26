import { ANY_GE, BASIC_SEARCH_PARAMS } from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/term';
import { WebsocFullCoursesOptionSchema } from '@packages/antalmanac-types';

export const COURSE_SEARCH_MODES = ['quick', 'manual'] as const;
export const DEFAULT_COURSE_SEARCH_MODE = COURSE_SEARCH_MODES[0];

export const COURSE_SEARCH_VIEWS = ['search', 'results'] as const;

export const SEARCH_MODE_URL_KEY = 'search';
export const SEARCH_VIEW_URL_KEY = 'view';

export const MANUAL_SEARCH_FIELDS = [...BASIC_SEARCH_PARAMS, 'deptValue', 'ge', 'courseNumber', 'sectionCode'] as const;

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
    coursesFull: WebsocFullCoursesOptionSchema.options[0],
    building: '',
    room: '',
    division: '',
    excludeRoadmapCourses: '',
    excludeRestrictionCodes: '',
    days: '',
} as const;

export const DEFAULT_TERM = getDefaultTerm();

export const defaultFormData = {
    term: DEFAULT_TERM,
    ...DEFAULT_MANUAL_SEARCH_VALUES,
    ...DEFAULT_ADVANCED_SEARCH_VALUES,
};
