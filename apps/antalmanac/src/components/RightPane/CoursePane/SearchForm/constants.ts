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

export const MANUAL_SEARCH_PARAMS = [
    'deptValue',
    'ge',
    'term',
    'courseNumber',
    'sectionCode',
    ...ADVANCED_SEARCH_PARAMS,
] as const;

export type ManualSearchParam = (typeof MANUAL_SEARCH_PARAMS)[number];
