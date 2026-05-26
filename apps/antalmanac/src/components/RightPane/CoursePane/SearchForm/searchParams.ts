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
import { useCallback, useMemo } from 'react';

/** nuqs updates stay client-side; React Router adapter key-isolates per watched key. */
const shallowQueryOptions = { shallow: true } as const;

type AdvancedSearchDefaults = Omit<CourseSearchParams, 'term' | 'deptValue' | 'ge' | 'courseNumber' | 'sectionCode'>;

export type AdvancedSearchParams = Pick<CourseSearchParams, (typeof ADVANCED_SEARCH_PARAMS)[number]>;
export type ManualSearchParams = Pick<CourseSearchParams, 'term' | 'deptValue' | 'ge' | 'courseNumber' | 'sectionCode'>;

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

/** URL query keys for course search form fields (1:1 with `CourseSearchField`). */
export const COURSE_SEARCH_URL_KEYS = {
    term: 'term',
    deptValue: 'deptValue',
    ge: 'ge',
    courseNumber: 'courseNumber',
    sectionCode: 'sectionCode',
    instructor: 'instructor',
    units: 'units',
    endTime: 'endTime',
    startTime: 'startTime',
    coursesFull: 'coursesFull',
    building: 'building',
    room: 'room',
    division: 'division',
    excludeRoadmapCourses: 'excludeRoadmapCourses',
    excludeRestrictionCodes: 'excludeRestrictionCodes',
    days: 'days',
} as const satisfies Record<CourseSearchField, string>;

export const SEARCH_MODE_URL_KEY = 'search';
export const SEARCH_VIEW_URL_KEY = 'view';

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
})
    .withDefault(defaultTerm)
    .withOptions(shallowQueryOptions);

const parseAsNormalizedGe = createParser<string>({
    parse: (value: string) => normalizeGeSelection(value),
    serialize: (value: string) => normalizeGeSelection(value),
    eq: (a: string, b: string) => normalizeGeSelection(a) === normalizeGeSelection(b),
})
    .withDefault(defaultFormData.ge)
    .withOptions(shallowQueryOptions);

const parseAsShallowString = (defaultValue: string) =>
    parseAsString.withDefault(defaultValue).withOptions(shallowQueryOptions);

export const manualSearchParsers = {
    term: parseAsCourseSearchTerm,
    deptValue: parseAsShallowString(defaultFormData.deptValue),
    ge: parseAsNormalizedGe,
    courseNumber: parseAsShallowString(defaultFormData.courseNumber),
    sectionCode: parseAsShallowString(defaultFormData.sectionCode),
};

export const advancedSearchParsers = {
    instructor: parseAsShallowString(defaultAdvancedSearchValues.instructor),
    units: parseAsShallowString(defaultAdvancedSearchValues.units),
    endTime: parseAsShallowString(defaultAdvancedSearchValues.endTime),
    startTime: parseAsShallowString(defaultAdvancedSearchValues.startTime),
    coursesFull: parseAsShallowString(WebsocFullCoursesOptionSchema.options[0]),
    building: parseAsShallowString(defaultAdvancedSearchValues.building),
    room: parseAsShallowString(defaultAdvancedSearchValues.room),
    division: parseAsShallowString(defaultAdvancedSearchValues.division),
    excludeRoadmapCourses: parseAsShallowString(defaultAdvancedSearchValues.excludeRoadmapCourses),
    excludeRestrictionCodes: parseAsShallowString(defaultAdvancedSearchValues.excludeRestrictionCodes),
    days: parseAsShallowString(defaultAdvancedSearchValues.days),
};

/** Full parser map — use for serialization / one-off batch writes, not broad subscriptions. */
export const courseSearchParamParsers = {
    ...manualSearchParsers,
    ...advancedSearchParsers,
};

const searchModeParser = parseAsStringLiteral(['manual', 'quick'] as const)
    .withDefault('quick')
    .withOptions(shallowQueryOptions);

const searchViewParser = parseAsStringLiteral(['results', 'search'] as const).withOptions(shallowQueryOptions);

const plannerSearchParser = parseAsString.withOptions(shallowQueryOptions);

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

export function hasAdvancedParams(formData: Pick<CourseSearchParams, (typeof ADVANCED_SEARCH_PARAMS)[number]>) {
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

/** Subscribe to a single URL-backed form field (nuqs key isolation). */
export function useCourseSearchParam<K extends CourseSearchField>(field: K) {
    const urlKey = COURSE_SEARCH_URL_KEYS[field];
    const parser = courseSearchParamParsers[field];
    const [value, setValueRaw] = useQueryState(urlKey, parser) as unknown as [
        CourseSearchParams[K],
        (next: CourseSearchParams[K] | null) => Promise<URLSearchParams>,
    ];

    const setValue = useCallback(
        (next: CourseSearchParams[K]) => {
            clearMultiSearchData();
            return setValueRaw(next);
        },
        [setValueRaw]
    );

    return [value, setValue] as const;
}

/** Advanced search fields only — rerenders when an advanced param changes. */
export function useAdvancedSearchParams() {
    const [advanced, setAdvancedRaw] = useQueryStates(advancedSearchParsers);

    const setAdvanced = useCallback(
        (values: Partial<AdvancedSearchParams>) => {
            clearMultiSearchData();
            return setAdvancedRaw(values);
        },
        [setAdvancedRaw]
    );

    const setField = useCallback(
        <K extends keyof AdvancedSearchParams>(field: K, value: AdvancedSearchParams[K]) => {
            clearMultiSearchData();
            return setAdvancedRaw({ [field]: value });
        },
        [setAdvancedRaw]
    );

    return { advanced, setAdvanced, setField };
}

/** Full form snapshot — use at submit/results boundaries, not leaf inputs. */
export function useCourseSearchFormData(): CourseSearchParams {
    const [manual] = useQueryStates(manualSearchParsers);
    const [advanced] = useQueryStates(advancedSearchParsers);
    return useMemo(() => ({ ...manual, ...advanced }), [manual, advanced]);
}

/** Mode / view chrome — watches `search`, `view`, and planner import param only. */
export function useCourseSearchChrome() {
    const [searchMode, setSearchModeParam] = useQueryState(SEARCH_MODE_URL_KEY, searchModeParser);
    const [viewParam, setViewParam] = useQueryState(SEARCH_VIEW_URL_KEY, searchViewParser);
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, plannerSearchParser);

    const manualSearchEnabled = searchMode === 'manual' && plannerSearchParam === null;

    const setSearchMode = useCallback((mode: CourseSearchMode) => setSearchModeParam(mode), [setSearchModeParam]);

    const showResults = useCallback(() => setViewParam('results'), [setViewParam]);

    const showSearchForm = useCallback(() => {
        clearMultiSearchData();
        return setViewParam('search');
    }, [setViewParam]);

    const clearView = useCallback(() => setViewParam(null), [setViewParam]);

    return {
        manualSearchEnabled,
        viewParam,
        setSearchMode,
        showResults,
        showSearchForm,
        clearView,
    };
}

/** Batch writes without subscribing to the full form. */
export function useCourseSearchActions() {
    const [, setManual] = useQueryStates(manualSearchParsers);
    const [, setAdvanced] = useQueryStates(advancedSearchParsers);
    const [term] = useQueryState(COURSE_SEARCH_URL_KEYS.term, manualSearchParsers.term);
    const { setSearchMode, showResults, showSearchForm, clearView } = useCourseSearchChrome();

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            clearMultiSearchData();
            if (values === null) {
                void setManual(null);
                void setAdvanced(null);
                return;
            }

            const manualPatch: Partial<ManualSearchParams> = {};
            const advancedPatch: Partial<AdvancedSearchParams> = {};

            for (const [key, value] of Object.entries(values) as [keyof CourseSearchParams, unknown][]) {
                if (key in manualSearchParsers) {
                    (manualPatch as Record<string, unknown>)[key] = value;
                }
                if (key in advancedSearchParsers) {
                    (advancedPatch as Record<string, unknown>)[key] = value;
                }
            }

            if (Object.keys(manualPatch).length > 0) void setManual(manualPatch);
            if (Object.keys(advancedPatch).length > 0) void setAdvanced(advancedPatch);
        },
        [setAdvanced, setManual]
    );

    const resetForm = useCallback(
        ({ preserveTerm = false }: { preserveTerm?: boolean } = {}) => {
            clearMultiSearchData();
            void setManual(preserveTerm ? { ...defaultFormData, term } : defaultFormData);
            void setAdvanced(defaultAdvancedSearchValues);
        },
        [setAdvanced, setManual, term]
    );

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
        setFields,
        resetForm,
        setSearchMode,
        showResults,
        showSearchForm,
        clearView,
        submitSearch,
    };
}

/** Pane-level hook: full form + chrome + derived view (CoursePaneRoot, SearchForm). */
export function useCourseSearchPane() {
    const formData = useCourseSearchFormData();
    const chrome = useCourseSearchChrome();
    const actions = useCourseSearchActions();

    const derivedView: CourseSearchView = shouldShowSearchForm(formData) ? 'search' : 'results';
    const view: CourseSearchView = chrome.manualSearchEnabled
        ? (chrome.viewParam ?? 'search')
        : (chrome.viewParam ?? derivedView);
    const searchFormIsDisplayed = view === 'search';

    return {
        formData,
        searchFormIsDisplayed,
        ...chrome,
        ...actions,
    };
}
