import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW,
    COURSE_SEARCH_VIEW_KEY,
    DEFAULT_FORM_DATA,
    COURSE_SEARCH_PLANNER_KEY,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import { isValidSearch, shouldShowSearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchParams/helpers';
import { readCourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/loaders';
import {
    courseSearchParamParsers,
    plannerSearchParser,
    searchModeParser,
    searchViewParser,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import type {
    CourseSearchMode,
    CourseSearchParams,
    CourseSearchView,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { useQueryState, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

export function useCourseSearchParam<K extends keyof CourseSearchParams>(
    field: K
): readonly [CourseSearchParams[K], (next: CourseSearchParams[K]) => void] {
    const parser = courseSearchParamParsers[field];
    const [value, setValueRaw] = useQueryState(field, parser);

    const setValue = useCallback(
        (next: CourseSearchParams[K]) => {
            RightPaneStore.clearMultiSearchData();
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

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            void setSearchModeParam(mode);
        },
        [setSearchModeParam]
    );

    const showResults = useCallback(() => {
        void setViewParam(COURSE_SEARCH_VIEW.RESULTS);
    }, [setViewParam]);

    const submitSearch = useCallback(
        (data?: CourseSearchParams) => {
            const payload = data ?? readCourseSearchParams();
            if (isValidSearch(payload)) {
                RightPaneStore.clearMultiSearchData();
                showResults();
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

    const derivedView: CourseSearchView = shouldShowSearchForm(formData)
        ? COURSE_SEARCH_VIEW.SEARCH_FORM
        : COURSE_SEARCH_VIEW.RESULTS;
    const view: CourseSearchView = manualSearchEnabled
        ? (viewParam ?? COURSE_SEARCH_VIEW.SEARCH_FORM)
        : (viewParam ?? derivedView);
    const searchFormIsDisplayed = view === COURSE_SEARCH_VIEW.SEARCH_FORM;

    const setField = useCallback(
        <Field extends keyof CourseSearchParams>(field: Field, value: CourseSearchParams[Field]) => {
            RightPaneStore.clearMultiSearchData();
            void setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            RightPaneStore.clearMultiSearchData();
            void setFormData(values);
        },
        [setFormData]
    );

    const resetForm = useCallback(
        ({ preserveTerm = false }: { preserveTerm?: boolean } = {}) => {
            RightPaneStore.clearMultiSearchData();
            void setFormData(preserveTerm ? { ...DEFAULT_FORM_DATA, term: formData.term } : DEFAULT_FORM_DATA);
        },
        [formData.term, setFormData]
    );

    const showSearchForm = useCallback(() => {
        RightPaneStore.clearMultiSearchData();
        void setViewParam(COURSE_SEARCH_VIEW.SEARCH_FORM);
    }, [setViewParam]);

    const clearView = useCallback(() => {
        void setViewParam(null);
    }, [setViewParam]);

    return {
        formData,
        manualSearchEnabled,
        searchFormIsDisplayed,
        viewParam,
        setSearchMode,
        submitSearch,
        showResults,
        showSearchForm,
        clearView,
        setField,
        setFields,
        resetForm,
    };
}
