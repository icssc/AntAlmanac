import { createSerializer, parseAsString, parseAsStringLiteral } from 'nuqs';

import { getDefaultTerm } from '$lib/termData';

export const SEARCH_MODES = ['quick', 'manual'] as const;
export type SearchMode = (typeof SEARCH_MODES)[number];

const defaultAdvancedSearchValues = {
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    coursesFull: 'ANY',
    building: '',
    room: '',
    division: '',
    excludeRoadmapCourses: '',
    excludeRestrictionCodes: '',
    days: '',
} as const;

const defaultFormValues = {
    deptValue: 'ALL',
    ge: 'ANY',
    term: getDefaultTerm().shortName,
    courseNumber: '',
    sectionCode: '',
    ...defaultAdvancedSearchValues,
} as const;

export type SearchFormData = { [K in keyof typeof defaultFormValues]: string };

export const searchParsers = {
    mode: parseAsStringLiteral(SEARCH_MODES).withDefault('quick'),
    term: parseAsString.withDefault(defaultFormValues.term),
    deptValue: parseAsString.withDefault(defaultFormValues.deptValue),
    ge: parseAsString.withDefault(defaultFormValues.ge),
    courseNumber: parseAsString.withDefault(defaultFormValues.courseNumber),
    sectionCode: parseAsString.withDefault(defaultFormValues.sectionCode),
    instructor: parseAsString.withDefault(defaultAdvancedSearchValues.instructor),
    units: parseAsString.withDefault(defaultAdvancedSearchValues.units),
    endTime: parseAsString.withDefault(defaultAdvancedSearchValues.endTime),
    startTime: parseAsString.withDefault(defaultAdvancedSearchValues.startTime),
    coursesFull: parseAsString.withDefault(defaultAdvancedSearchValues.coursesFull),
    building: parseAsString.withDefault(defaultAdvancedSearchValues.building),
    room: parseAsString.withDefault(defaultAdvancedSearchValues.room),
    division: parseAsString.withDefault(defaultAdvancedSearchValues.division),
    excludeRoadmapCourses: parseAsString.withDefault(defaultAdvancedSearchValues.excludeRoadmapCourses),
    excludeRestrictionCodes: parseAsString.withDefault(defaultAdvancedSearchValues.excludeRestrictionCodes),
    days: parseAsString.withDefault(defaultAdvancedSearchValues.days),
};

export const ADVANCED_SEARCH_KEYS = Object.keys(
    defaultAdvancedSearchValues
) as (keyof typeof defaultAdvancedSearchValues)[];

export const BASIC_SEARCH_KEYS = ['deptValue', 'ge', 'courseNumber', 'sectionCode'] as const;

export const serializeSearchParams = createSerializer(searchParsers);

export function formDataIsValid(formData: SearchFormData) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function formDataHasAdvancedSearch(formData: SearchFormData) {
    return ADVANCED_SEARCH_KEYS.some((key) => formData[key] !== defaultAdvancedSearchValues[key]);
}

export function getDefaultFormValues(): SearchFormData {
    return { ...defaultFormValues };
}

export function getDefaultAdvancedSearchValues() {
    return { ...defaultAdvancedSearchValues };
}
