export const ADVANCED_SEARCH_PARAMS = [
    'instructor',
    'units',
    'endTime',
    'startTime',
    'coursesFull',
    'building',
    'room',
    'division',
    'excludeRestrictionCodes',
    'days',
];

export type AdvancedSearchParam = (typeof ADVANCED_SEARCH_PARAMS)[number];

export const MANUAL_SEARCH_PARAMS = [
    'deptValue',
    'ge',
    'term',
    'courseNumber',
    'sectionCode',
    ...ADVANCED_SEARCH_PARAMS,
];

export type ManualSearchParam = (typeof MANUAL_SEARCH_PARAMS)[number];
