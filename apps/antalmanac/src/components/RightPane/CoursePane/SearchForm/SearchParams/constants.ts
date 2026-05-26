import { ANY_GE, BASIC_SEARCH_PARAMS } from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/term';
import { WebsocFullCoursesOptionSchema } from '@packages/antalmanac-types';

export const COURSE_SEARCH_MODE = {
    QUICK: 'quick',
    MANUAL: 'manual',
} as const;
export const COURSE_SEARCH_MODE_KEY = 'search';
export const COURSE_SEARCH_MODES = [COURSE_SEARCH_MODE.QUICK, COURSE_SEARCH_MODE.MANUAL] as const;
export const DEFAULT_COURSE_SEARCH_MODE = COURSE_SEARCH_MODE.QUICK;

export const COURSE_SEARCH_VIEW = {
    SEARCH_FORM: 'search',
    RESULTS: 'results',
} as const;
export const COURSE_SEARCH_VIEW_KEY = 'view';
export const COURSE_SEARCH_VIEWS = [COURSE_SEARCH_VIEW.SEARCH_FORM, COURSE_SEARCH_VIEW.RESULTS] as const;

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

export const DEFAULT_FORM_DATA = {
    term: DEFAULT_TERM,
    ...DEFAULT_MANUAL_SEARCH_VALUES,
    ...DEFAULT_ADVANCED_SEARCH_VALUES,
};
