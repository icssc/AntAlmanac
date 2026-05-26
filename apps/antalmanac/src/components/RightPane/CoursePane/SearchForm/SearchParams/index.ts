import {
    ADVANCED_SEARCH_PARAMS,
    MANUAL_SEARCH_PARAMS,
    PLANNER_SEARCH_PARAM,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import {
    DEFAULT_ADVANCED_SEARCH_VALUES,
    defaultFormData,
    SEARCH_MODE_URL_KEY,
    SEARCH_VIEW_URL_KEY,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import {
    advancedSearchParsers,
    courseSearchParamParsers,
    manualSearchParsers,
    plannerSearchParser,
    searchModeParser,
    searchViewParser,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import type {
    AdvancedSearchParams,
    CourseSearchMode,
    CourseSearchParams,
    CourseSearchView,
    ManualSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { useQueryState, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

/** Enough to run a WebSOC search (dept, GE, section, or instructor). */
export function isValidSearch(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return ge !== 'ANY' || deptValue !== 'ALL' || sectionCode !== '' || instructor !== '';
}

export function hasManualParams(formData: CourseSearchParams) {
    return MANUAL_SEARCH_PARAMS.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== defaultFormData.term.shortName;
        }
        return formData[key] !== defaultFormData[key];
    });
}

export function hasAdvancedParams(formData: Pick<CourseSearchParams, (typeof ADVANCED_SEARCH_PARAMS)[number]>) {
    return ADVANCED_SEARCH_PARAMS.some((key) => formData[key] !== DEFAULT_ADVANCED_SEARCH_VALUES[key]);
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
export function useCourseSearchParam<K extends keyof CourseSearchParams>(field: K) {
    const parser = courseSearchParamParsers[field];
    const [value, setValueRaw] = useQueryState(field, parser) as unknown as [
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
    const [term] = useQueryState('term', manualSearchParsers.term);
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
            void setAdvanced(DEFAULT_ADVANCED_SEARCH_VALUES);
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
