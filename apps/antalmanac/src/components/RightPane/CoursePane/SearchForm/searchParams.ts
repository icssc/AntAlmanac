import {
    ADVANCED_SEARCH_PARAMS,
    PLANNER_SEARCH_PARAM,
    normalizeGeSelection,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm, getTermByShortName } from '$lib/term';
import { openSnackbar } from '$stores/SnackbarStore';
import { WebsocFullCoursesOptionSchema, type AATerm } from '@packages/antalmanac-types';
import {
    createParser,
    createSerializer,
    parseAsString,
    parseAsStringLiteral,
    useQueryState,
    useQueryStates,
} from 'nuqs';
import { useCallback } from 'react';

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

export type CourseSearchField = keyof CourseSearchParams;

export type CourseSearchMode = 'quick' | 'manual';
export type CourseSearchView = 'search' | 'results';

export const defaultFormData: CourseSearchParams = {
    term: defaultTerm,
    deptValue: 'ALL',
    ge: 'ANY',
    courseNumber: '',
    sectionCode: '',
    ...defaultAdvancedSearchValues,
};

const parseAsCourseSearchTerm = createParser<AATerm>({
    parse: (value) => getTermByShortName(value) ?? null,
    serialize: (value) => value.shortName,
    eq: (a, b) => a.shortName === b.shortName,
}).withDefault(defaultTerm);

const parseAsNormalizedGe = createParser<string>({
    parse: (value) => normalizeGeSelection(value),
    serialize: (value) => normalizeGeSelection(value),
    eq: (a, b) => normalizeGeSelection(a) === normalizeGeSelection(b),
}).withDefault(defaultFormData.ge);

export const courseSearchParamParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: parseAsString.withDefault(defaultFormData.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: parseAsString.withDefault(defaultFormData.courseNumber),
    sectionCode: parseAsString.withDefault(defaultFormData.sectionCode),
    instructor: parseAsString.withDefault(defaultAdvancedSearchValues.instructor),
    units: parseAsString.withDefault(defaultAdvancedSearchValues.units),
    endTime: parseAsString.withDefault(defaultAdvancedSearchValues.endTime),
    startTime: parseAsString.withDefault(defaultAdvancedSearchValues.startTime),
    coursesFull: parseAsString.withDefault(WebsocFullCoursesOptionSchema.options[0]),
    building: parseAsString.withDefault(defaultAdvancedSearchValues.building),
    room: parseAsString.withDefault(defaultAdvancedSearchValues.room),
    division: parseAsString.withDefault(defaultAdvancedSearchValues.division),
    excludeRoadmapCourses: parseAsString.withDefault(defaultAdvancedSearchValues.excludeRoadmapCourses),
    excludeRestrictionCodes: parseAsString.withDefault(defaultAdvancedSearchValues.excludeRestrictionCodes),
    days: parseAsString.withDefault(defaultAdvancedSearchValues.days),
};

export const serializeCourseSearchParams = createSerializer(courseSearchParamParsers);

/** Enough to run a WebSOC search (dept, GE, section, or instructor). */
export function courseSearchFormDataIsValid(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge !== 'ANY' || deptValue !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function courseSearchFormDataHasAdvancedSearch(formData: CourseSearchParams) {
    return ADVANCED_SEARCH_PARAMS.some((key) => formData[key] !== defaultAdvancedSearchValues[key]);
}

/** Show the search form when params are empty or present but not valid enough for results. */
export function courseSearchFormDataShouldShowSearchForm(formData: CourseSearchParams) {
    const hasPrimarySearchInput =
        formData.sectionCode !== '' ||
        formData.courseNumber !== '' ||
        formData.ge !== 'ANY' ||
        formData.deptValue !== 'ALL';

    return !hasPrimarySearchInput || !courseSearchFormDataIsValid(formData);
}

export function useCourseSearchUrlState() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);
    const [searchMode, setSearchModeParam] = useQueryState(
        'search',
        parseAsStringLiteral(['manual', 'quick'] as const).withDefault('quick')
    );
    const [viewParam, setViewParam] = useQueryState('view', parseAsStringLiteral(['results', 'search'] as const));
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, parseAsString);
    const manualSearchEnabled = searchMode === 'manual' && plannerSearchParam === null;

    const derivedView: CourseSearchView = courseSearchFormDataShouldShowSearchForm(formData) ? 'search' : 'results';
    const view: CourseSearchView = viewParam ?? derivedView;
    const searchFormIsDisplayed = view === 'search';

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

    const resetAll = useCallback(() => {
        return setFormData(defaultFormData);
    }, [setFormData]);

    const resetAllPreservingTerm = useCallback(() => {
        return setFormData({ ...defaultFormData, term: formData.term });
    }, [formData.term, setFormData]);

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            return setSearchModeParam(mode);
        },
        [setSearchModeParam]
    );

    /** Navigate to the results pane. */
    const showResults = useCallback(() => setViewParam('results'), [setViewParam]);

    /** Navigate to the search form (keeps params intact — use for manual-mode back). */
    const showSearchForm = useCallback(() => setViewParam('search'), [setViewParam]);

    /** Clear URL view override; pane follows derivedView from search params. */
    const clearView = useCallback(() => setViewParam(null), [setViewParam]);

    /** Validate and submit a search. Shows results on success, error snackbar on failure. */
    const submitSearch = useCallback(
        (data: CourseSearchParams) => {
            if (courseSearchFormDataIsValid(data)) {
                void showResults();
                return true;
            }
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
            return false;
        },
        [showResults]
    );

    return {
        formData,
        manualSearchEnabled,
        searchFormIsDisplayed,
        showResults,
        showSearchForm,
        clearView,
        submitSearch,
        setField,
        setFields,
        setSearchMode,
        resetAll,
        resetAllPreservingTerm,
    };
}
