import { ANY_GE } from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/term';
import { WebsocFullCoursesOptionSchema } from '@packages/antalmanac-types';

export const ADVANCED_SEARCH_PARAMS = [
    'instructor',
    'units',
    'endTime',
    'startTime',
    'coursesFull',
    'building',
    'room',
    'division',
    'excludeRoadmapCourses',
    'excludeRestrictionCodes',
    'days',
] as const;
export type AdvancedSearchParam = (typeof ADVANCED_SEARCH_PARAMS)[number];

export const MANUAL_SEARCH_PARAMS = ['term', 'deptValue', 'ge', 'courseNumber', 'sectionCode'] as const;
export type ManualSearchParam = (typeof MANUAL_SEARCH_PARAMS)[number];

export const COURSE_SEARCH_MODE_KEY = 'search';
export const COURSE_SEARCH_VIEW_KEY = 'view';
export const COURSE_SEARCH_PLANNER_KEY = 'importRoadmap';

export const COURSE_SEARCH_MODE = {
    QUICK: 'quick',
    MANUAL: 'manual',
} as const;

export const COURSE_SEARCH_MODES = [COURSE_SEARCH_MODE.QUICK, COURSE_SEARCH_MODE.MANUAL] as const;

export const COURSE_SEARCH_VIEW = {
    SEARCH_FORM: 'search',
    RESULTS: 'results',
} as const;

export const COURSE_SEARCH_VIEWS = [COURSE_SEARCH_VIEW.SEARCH_FORM, COURSE_SEARCH_VIEW.RESULTS] as const;

export const DEFAULT_TERM = getDefaultTerm();

export const DEFAULT_MANUAL_SEARCH_VALUES = {
    deptValue: 'ALL',
    ge: ANY_GE,
    courseNumber: '',
    sectionCode: '',
} as const satisfies Record<Exclude<ManualSearchParam, 'term'>, string>;

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
} as const satisfies Record<AdvancedSearchParam, string>;

export const DEFAULT_FORM_DATA = {
    term: DEFAULT_TERM,
    ...DEFAULT_MANUAL_SEARCH_VALUES,
    ...DEFAULT_ADVANCED_SEARCH_VALUES,
};
