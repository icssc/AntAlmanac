import {
    ADVANCED_SEARCH_PARAMS,
    MANUAL_SEARCH_PARAMS,
    PLANNER_SEARCH_PARAM,
    normalizeGeSelection,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
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
    parse: (value: string) => getTermByShortName(value) ?? null,
    serialize: (value: AATerm) => value.shortName,
    eq: (a: AATerm, b: AATerm) => a.shortName === b.shortName,
}).withDefault(defaultTerm);

const parseAsNormalizedGe = createParser<string>({
    parse: (value: string) => normalizeGeSelection(value),
    serialize: (value: string) => normalizeGeSelection(value),
    eq: (a: string, b: string) => normalizeGeSelection(a) === normalizeGeSelection(b),
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

export function hasSearchParams(formData: CourseSearchParams) {
    return MANUAL_SEARCH_PARAMS.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== defaultFormData.term.shortName;
        }
        return formData[key] !== defaultFormData[key];
    });
}

/** Enough to run a WebSOC search (dept, GE, section, or instructor). */
export function isValidSearch(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge !== 'ANY' || deptValue !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function hasAdvancedParams(formData: CourseSearchParams) {
    return ADVANCED_SEARCH_PARAMS.some((key) => formData[key] !== defaultAdvancedSearchValues[key]);
}

/** Show the search form when params are empty or present but not valid enough for results. */
export function shouldShowSearchForm(formData: CourseSearchParams) {
    const hasPrimarySearchInput =
        formData.sectionCode !== '' ||
        formData.courseNumber !== '' ||
        formData.ge !== 'ANY' ||
        formData.deptValue !== 'ALL' ||
        formData.instructor !== '';

    return !hasPrimarySearchInput || !isValidSearch(formData);
}

/** Drop planner batch search so URL-driven queries take precedence. */
export function clearMultiSearchData() {
    RightPaneStore.clearMultiSearchData();
}

export function useCourseSearchUrlStateValue() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);
    const [searchMode, setSearchModeParam] = useQueryState(
        'search',
        parseAsStringLiteral(['manual', 'quick'] as const).withDefault('quick')
    );
    const [viewParam, setViewParam] = useQueryState('view', parseAsStringLiteral(['results', 'search'] as const));
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, parseAsString);
    const manualSearchEnabled = searchMode === 'manual' && plannerSearchParam === null;

    const derivedView: CourseSearchView = shouldShowSearchForm(formData) ? 'search' : 'results';
    const view: CourseSearchView = manualSearchEnabled ? (viewParam ?? 'search') : (viewParam ?? derivedView);
    const searchFormIsDisplayed = view === 'search';

    const setField = useCallback(
        <Field extends CourseSearchField>(field: Field, value: CourseSearchParams[Field]) => {
            clearMultiSearchData();
            return setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            clearMultiSearchData();
            return setFormData(values);
        },
        [setFormData]
    );

    const resetForm = useCallback(
        ({ preserveTerm = false }: { preserveTerm?: boolean } = {}) => {
            clearMultiSearchData();
            return setFormData(preserveTerm ? { ...defaultFormData, term: formData.term } : defaultFormData);
        },
        [formData.term, setFormData]
    );

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            return setSearchModeParam(mode);
        },
        [setSearchModeParam]
    );

    /** Navigate to the results pane. */
    const showResults = useCallback(() => setViewParam('results'), [setViewParam]);

    /** Navigate to the search form (keeps params intact — use for manual-mode back). */
    const showSearchForm = useCallback(() => {
        clearMultiSearchData();
        return setViewParam('search');
    }, [setViewParam]);

    /** Clear URL view override; pane follows derivedView from search params. */
    const clearView = useCallback(() => setViewParam(null), [setViewParam]);

    /** Validate and submit a search. Shows results on success, error snackbar on failure. */
    const submitSearch = useCallback(
        (data: CourseSearchParams) => {
            if (isValidSearch(data)) {
                clearMultiSearchData();
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
        resetForm,
    };
}
