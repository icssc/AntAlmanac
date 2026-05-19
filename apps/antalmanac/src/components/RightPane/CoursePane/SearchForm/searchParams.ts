import { normalizeGeSelection } from '$lib/multiGeSearch';
import { getDefaultTerm, getTermByShortName } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { createParser, createSerializer, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

const REPLACE_HISTORY_OPTIONS = { history: 'replace' as const };

const COURSES_FULL_OPTIONS = ['ANY', 'SkipFullWaitlist', 'SkipFull', 'FullOnly', 'Overenrolled'] as const;

export type CoursesFullOption = (typeof COURSES_FULL_OPTIONS)[number];

type AdvancedSearchDefaults = Omit<CourseSearchParams, 'term' | 'deptValue' | 'ge' | 'courseNumber' | 'sectionCode'>;

const defaultTerm = getDefaultTerm();

export const defaultAdvancedSearchValues: AdvancedSearchDefaults = {
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
};

export interface CourseSearchParams {
    term: AATerm;
    deptValue: string;
    ge: string;
    courseNumber: string;
    sectionCode: string;
    instructor: string;
    units: string;
    endTime: string;
    startTime: string;
    coursesFull: CoursesFullOption;
    building: string;
    room: string;
    division: string;
    excludeRoadmapCourses: string;
    excludeRestrictionCodes: string;
    days: string;
}

export type CourseSearchField = Exclude<keyof CourseSearchParams, 'term'>;

export const defaultCourseSearchFormValues: CourseSearchParams = {
    term: defaultTerm,
    deptValue: 'ALL',
    ge: 'ANY',
    courseNumber: '',
    sectionCode: '',
    ...defaultAdvancedSearchValues,
};

const createStringParser = (defaultValue = '') =>
    parseAsString.withOptions(REPLACE_HISTORY_OPTIONS).withDefault(defaultValue);

const parseAsCourseSearchTerm = createParser<AATerm>({
    parse: (value) => getTermByShortName(value) ?? null,
    serialize: (value) => value.shortName,
    eq: (a, b) => a.shortName === b.shortName,
})
    .withOptions(REPLACE_HISTORY_OPTIONS)
    .withDefault(defaultTerm);

const parseAsNormalizedGe = createParser<string>({
    parse: (value) => normalizeGeSelection(value),
    serialize: (value) => normalizeGeSelection(value),
    eq: (a, b) => normalizeGeSelection(a) === normalizeGeSelection(b),
})
    .withOptions(REPLACE_HISTORY_OPTIONS)
    .withDefault(defaultCourseSearchFormValues.ge);

export const courseSearchParamParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: createStringParser(defaultCourseSearchFormValues.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: createStringParser(defaultCourseSearchFormValues.courseNumber),
    sectionCode: createStringParser(defaultCourseSearchFormValues.sectionCode),
    instructor: createStringParser(defaultAdvancedSearchValues.instructor),
    units: createStringParser(defaultAdvancedSearchValues.units),
    endTime: createStringParser(defaultAdvancedSearchValues.endTime),
    startTime: createStringParser(defaultAdvancedSearchValues.startTime),
    coursesFull: parseAsStringLiteral(COURSES_FULL_OPTIONS)
        .withOptions(REPLACE_HISTORY_OPTIONS)
        .withDefault(defaultAdvancedSearchValues.coursesFull),
    building: createStringParser(defaultAdvancedSearchValues.building),
    room: createStringParser(defaultAdvancedSearchValues.room),
    division: createStringParser(defaultAdvancedSearchValues.division),
    excludeRoadmapCourses: createStringParser(defaultAdvancedSearchValues.excludeRoadmapCourses),
    excludeRestrictionCodes: createStringParser(defaultAdvancedSearchValues.excludeRestrictionCodes),
    days: createStringParser(defaultAdvancedSearchValues.days),
};

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);

export function buildCourseSearchFormData(
    values: Partial<CourseSearchParams> = defaultCourseSearchFormValues
): CourseSearchParams {
    return {
        ...defaultCourseSearchFormValues,
        ...values,
        term: values.term ?? defaultCourseSearchFormValues.term,
        ge: normalizeGeSelection(values.ge ?? defaultCourseSearchFormValues.ge),
    };
}

export function useCourseSearchUrlState() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);

    const setField = useCallback(
        <Field extends CourseSearchField>(field: Field, value: CourseSearchParams[Field]) => {
            return setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            return setFormData(values);
        },
        [setFormData]
    );

    const setTerm = useCallback(
        (term: AATerm) => {
            return setFormData({ term });
        },
        [setFormData]
    );

    const resetAll = useCallback(() => {
        return setFormData(defaultCourseSearchFormValues);
    }, [setFormData]);

    const resetAdvanced = useCallback(() => {
        return setFormData(defaultAdvancedSearchValues);
    }, [setFormData]);

    return {
        formData,
        setField,
        setFields,
        setFormData,
        setTerm,
        resetAll,
        resetAdvanced,
        defaultFormData: defaultCourseSearchFormValues,
    };
}
