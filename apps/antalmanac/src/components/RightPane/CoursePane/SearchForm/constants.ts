export const BASIC_SEARCH_PARAMS = ['term'] as const;

export type BasicSearchParam = (typeof BASIC_SEARCH_PARAMS)[number];

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
    'courseNumber',
    'sectionCode',
    ...BASIC_SEARCH_PARAMS,
    ...ADVANCED_SEARCH_PARAMS,
] as const;

export type ManualSearchParam = (typeof MANUAL_SEARCH_PARAMS)[number];

export const PLANNER_SEARCH_PARAM = 'importRoadmap';

export const GE_LIST = [
    { value: 'ANY', label: "All: Don't filter for GE", shortLabel: 'All GEs' },
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing', shortLabel: 'GE Ia (1a)' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing', shortLabel: 'GE Ib (1b)' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology', shortLabel: 'GE II (2)' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences', shortLabel: 'GE III (3)' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities', shortLabel: 'GE IV (4)' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy', shortLabel: 'GE Va (5a)' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning', shortLabel: 'GE Vb (5b)' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English', shortLabel: 'GE VI (6)' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies', shortLabel: 'GE VII (7)' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues', shortLabel: 'GE VIII (8)' },
] as const;

export const ANY_GE = GE_LIST[0].value;

/** Delimiter for multi-GE AND selections in form state and URL query params. */
export const GE_SELECTION_DELIMITER = ' and ';

const VALID_GES: Set<string> = new Set(GE_LIST.map((option) => option.value).filter((value) => value !== ANY_GE));

const parseSelectedGEs = (ge: string) => {
    const validGEs = ge
        .split(/\s+and\s+|,/i)
        .map((value) => value.trim().toUpperCase())
        .filter((value) => VALID_GES.has(value));

    return validGEs.length === 0 ? [] : [...new Set(validGEs)];
};

export const getSelectedGEs = (ge: string) => parseSelectedGEs(ge);

export const normalizeGeSelection = (ge: string) => {
    const selectedGEs = parseSelectedGEs(ge);
    return selectedGEs.length > 0 ? selectedGEs.join(GE_SELECTION_DELIMITER) : ANY_GE;
};
