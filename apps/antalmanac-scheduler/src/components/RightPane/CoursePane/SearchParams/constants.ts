export const ADVANCED_SEARCH_PARAMS = [
    'instructor',
    'units',
    'endTime',
    'startTime',
    'fullCourses',
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
