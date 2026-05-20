import {
    type AdvancedSearchParam,
    MANUAL_SEARCH_PARAMS,
    normalizeGeSelection,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm, getTermByShortName } from '$lib/term';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { WebsocFullCoursesOptionSchema, type AATerm } from '@packages/antalmanac-types';
import { createParser, createSerializer, parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

const REPLACE_HISTORY_OPTIONS = { history: 'replace' as const };

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
    coursesFull: string;
    building: string;
    room: string;
    division: string;
    excludeRoadmapCourses: string;
    excludeRestrictionCodes: string;
    days: string;
}

export type CourseSearchField = Exclude<keyof CourseSearchParams, 'term'>;

export type CourseSearchMode = 'quick' | 'manual';

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
    coursesFull: createStringParser(WebsocFullCoursesOptionSchema.options[0]),
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

export function courseSearchFormDataIsValid(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function courseSearchFormDataHasAdvancedSearch(formData: CourseSearchParams) {
    const formFields = Object.keys(defaultAdvancedSearchValues) as AdvancedSearchParam[];
    return formFields.some((key) => formData[key] !== defaultAdvancedSearchValues[key]);
}

export function courseSearchFormDataHasManualSearch(formData: CourseSearchParams) {
    const formFields = MANUAL_SEARCH_PARAMS as readonly (keyof CourseSearchParams)[];
    return formFields.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== defaultCourseSearchFormValues.term.shortName;
        }

        return formData[key] !== defaultCourseSearchFormValues[key];
    });
}

export function courseSearchFormDataHasRequiredSearchParams(formData: CourseSearchParams) {
    return (
        formData.sectionCode !== '' ||
        formData.courseNumber !== '' ||
        formData.ge !== 'ANY' ||
        formData.deptValue !== 'ALL'
    );
}

const parseAsManualSearchMode = createParser<'manual'>({
    parse: (value) => (value === 'manual' ? 'manual' : null),
    serialize: (value) => value,
    eq: (a, b) => a === b,
}).withOptions(REPLACE_HISTORY_OPTIONS);

export function useCourseSearchUrlState() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);
    const [searchModeParam, setSearchModeParam] = useQueryState('search', parseAsManualSearchMode);
    const searchMode: CourseSearchMode = searchModeParam === 'manual' ? 'manual' : 'quick';

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

    const resetAllPreservingTerm = useCallback(() => {
        return setFormData({ ...defaultCourseSearchFormValues, term: formData.term });
    }, [formData.term, setFormData]);

    const resetAdvanced = useCallback(() => {
        return setFormData(defaultAdvancedSearchValues);
    }, [setFormData]);

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            return setSearchModeParam(mode === 'manual' ? 'manual' : null);
        },
        [setSearchModeParam]
    );

    return {
        formData,
        searchMode,
        setField,
        setFields,
        setFormData,
        setTerm,
        setSearchMode,
        resetAll,
        resetAllPreservingTerm,
        resetAdvanced,
        defaultFormData: defaultCourseSearchFormValues,
    };
}

export function useCourseSearchSubmit() {
    const setSearchFormIsDisplayed = useCoursePaneStore((store) => store.setSearchFormIsDisplayed);

    return useCallback(
        (formData: CourseSearchParams) => {
            if (courseSearchFormDataIsValid(formData)) {
                setSearchFormIsDisplayed(false);
                return true;
            }

            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
            return false;
        },
        [setSearchFormIsDisplayed]
    );
}
