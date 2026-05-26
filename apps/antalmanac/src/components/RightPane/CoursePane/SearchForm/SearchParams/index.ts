import {
    ADVANCED_SEARCH_PARAMS,
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW,
    COURSE_SEARCH_VIEW_KEY,
    DEFAULT_ADVANCED_SEARCH_VALUES,
    DEFAULT_FORM_DATA,
    MANUAL_SEARCH_PARAMS,
    COURSE_SEARCH_PLANNER_KEY,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import { readCourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/loaders';
import {
    courseSearchParamParsers,
    plannerSearchParser,
    searchModeParser,
    searchViewParser,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import type {
    AdvancedSearchParams,
    CourseSearchMode,
    CourseSearchParams,
    CourseSearchView,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { useQueryState, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

/** Enough to run a WebSOC search (dept, GE, section, or instructor). */
export function isValidSearch(formData: CourseSearchParams) {
    const { ge, deptValue, sectionCode, instructor } = formData;
    return (
        ge !== DEFAULT_FORM_DATA.ge ||
        deptValue !== DEFAULT_FORM_DATA.deptValue ||
        sectionCode !== DEFAULT_FORM_DATA.sectionCode ||
        instructor !== DEFAULT_FORM_DATA.instructor
    );
}

export function hasManualParams(formData: CourseSearchParams) {
    return MANUAL_SEARCH_PARAMS.some((key) => {
        if (key === 'term') {
            return formData.term.shortName !== DEFAULT_FORM_DATA.term.shortName;
        }
        return formData[key] !== DEFAULT_FORM_DATA[key];
    });
}

export function hasAdvancedParams(formData: AdvancedSearchParams) {
    return ADVANCED_SEARCH_PARAMS.some((key) => formData[key] !== DEFAULT_ADVANCED_SEARCH_VALUES[key]);
}

/** Show the search form when params are empty or present but not valid enough for results. */
export function shouldShowSearchForm(formData: CourseSearchParams) {
    const hasPrimarySearchInput =
        formData.sectionCode !== DEFAULT_FORM_DATA.sectionCode ||
        formData.courseNumber !== DEFAULT_FORM_DATA.courseNumber ||
        formData.ge !== DEFAULT_FORM_DATA.ge ||
        formData.deptValue !== DEFAULT_FORM_DATA.deptValue ||
        formData.instructor !== DEFAULT_FORM_DATA.instructor;

    return !hasPrimarySearchInput || !isValidSearch(formData);
}

/** Drop planner batch search so URL-driven queries take precedence. */
export function clearMultiSearchData() {
    RightPaneStore.clearMultiSearchData();
}

export function useCourseSearchParam<K extends keyof CourseSearchParams>(
    field: K
): readonly [CourseSearchParams[K], (next: CourseSearchParams[K]) => void] {
    const parser = courseSearchParamParsers[field];
    const [value, setValueRaw] = useQueryState(field, parser);

    const setValue = useCallback(
        (next: CourseSearchParams[K]) => {
            clearMultiSearchData();
            void setValueRaw(next);
        },
        [setValueRaw]
    );

    return [value, setValue];
}

export function useCourseSearchUrl() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);
    const [searchMode, setSearchModeParam] = useQueryState(COURSE_SEARCH_MODE_KEY, searchModeParser);
    const [viewParam, setViewParam] = useQueryState(COURSE_SEARCH_VIEW_KEY, searchViewParser);
    const [plannerSearchParam] = useQueryState(COURSE_SEARCH_PLANNER_KEY, plannerSearchParser);

    const manualSearchEnabled = searchMode === COURSE_SEARCH_MODE.MANUAL && plannerSearchParam === null;

    const derivedView: CourseSearchView = shouldShowSearchForm(formData)
        ? COURSE_SEARCH_VIEW.SEARCH_FORM
        : COURSE_SEARCH_VIEW.RESULTS;
    const view: CourseSearchView = manualSearchEnabled
        ? (viewParam ?? COURSE_SEARCH_VIEW.SEARCH_FORM)
        : (viewParam ?? derivedView);
    const searchFormIsDisplayed = view === COURSE_SEARCH_VIEW.SEARCH_FORM;

    const setField = useCallback(
        <Field extends keyof CourseSearchParams>(field: Field, value: CourseSearchParams[Field]) => {
            clearMultiSearchData();
            void setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            clearMultiSearchData();
            void setFormData(values);
        },
        [setFormData]
    );

    const resetForm = useCallback(
        ({ preserveTerm = false }: { preserveTerm?: boolean } = {}) => {
            clearMultiSearchData();
            void setFormData(preserveTerm ? { ...DEFAULT_FORM_DATA, term: formData.term } : DEFAULT_FORM_DATA);
        },
        [formData.term, setFormData]
    );

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            void setSearchModeParam(mode);
        },
        [setSearchModeParam]
    );

    const showResults = useCallback(() => {
        void setViewParam(COURSE_SEARCH_VIEW.RESULTS);
    }, [setViewParam]);

    const showSearchForm = useCallback(() => {
        clearMultiSearchData();
        void setViewParam(COURSE_SEARCH_VIEW.SEARCH_FORM);
    }, [setViewParam]);

    const clearView = useCallback(() => {
        void setViewParam(null);
    }, [setViewParam]);

    const submitSearch = useCallback(
        (data?: CourseSearchParams) => {
            const payload = data ?? readCourseSearchParams();
            if (isValidSearch(payload)) {
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
        viewParam,
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
