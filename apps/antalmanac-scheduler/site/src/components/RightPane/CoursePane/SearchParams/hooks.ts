import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW,
    COURSE_SEARCH_VIEW_KEY,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import { DEFAULT_FORM_DATA } from '$components/RightPane/CoursePane/SearchParams/defaults';
import { deriveCourseSearchView, isValidSearch } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { readCourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/loaders';
import {
    courseSearchParamParsers,
    searchModeParser,
    searchViewParser,
} from '$components/RightPane/CoursePane/SearchParams/parsers';
import type { CourseSearchMode, CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { openSnackbar } from '$stores/SnackbarStore';
import { useQueryState, useQueryStates } from 'nuqs';
import { useCallback } from 'react';

export function useCourseSearchParam<K extends keyof CourseSearchParams>(
    field: K
): readonly [CourseSearchParams[K], (next: CourseSearchParams[K]) => void] {
    // NB: generic K widens `parsers[field]` to a union; cast keeps single-field `useQueryState` perf.
    const parser = courseSearchParamParsers[field] as (typeof courseSearchParamParsers)[K];
    const [value, setValueRaw] = useQueryState(field, parser);
    const [courseIds, setCourseIds] = useQueryState('courseIds', courseSearchParamParsers.courseIds);

    const setValue = useCallback(
        (next: CourseSearchParams[K]) => {
            // A roadmap search (courseIds) is mutually exclusive with the other search
            // fields — editing any of them starts a fresh search, so clear the stale
            // courseIds that would otherwise silently override the new input.
            if (field !== 'courseIds' && courseIds.length > 0) {
                void setCourseIds([]);
            }
            void (setValueRaw as (next: CourseSearchParams[K]) => ReturnType<typeof setValueRaw>)(next);
        },
        [field, courseIds, setValueRaw, setCourseIds]
    );

    return [value as CourseSearchParams[K], setValue];
}

export function useCourseSearchMode() {
    const [searchMode, setSearchModeParam] = useQueryState(COURSE_SEARCH_MODE_KEY, searchModeParser);

    const manualSearchEnabled = searchMode === COURSE_SEARCH_MODE.MANUAL;

    const setSearchMode = useCallback(
        (mode: CourseSearchMode) => {
            void setSearchModeParam(mode);
        },
        [setSearchModeParam]
    );

    return {
        manualSearchEnabled,
        setSearchMode,
    };
}

export function useCourseSearchForm() {
    const [formData, setFormData] = useQueryStates(courseSearchParamParsers);

    const setField = useCallback(
        <Field extends keyof CourseSearchParams>(field: Field, value: CourseSearchParams[Field]) => {
            void setFormData({ [field]: value });
        },
        [setFormData]
    );

    const setFields = useCallback(
        (values: Partial<CourseSearchParams> | null) => {
            void setFormData(values);
        },
        [setFormData]
    );

    const resetForm = useCallback(
        ({ preserveTerm = false }: { preserveTerm?: boolean } = {}) => {
            void setFormData(preserveTerm ? { ...DEFAULT_FORM_DATA, term: formData.term } : DEFAULT_FORM_DATA);
        },
        [formData.term, setFormData]
    );

    return {
        formData,
        setField,
        setFields,
        resetForm,
    };
}

export function useCourseSearchView() {
    const { manualSearchEnabled } = useCourseSearchMode();
    const [formData] = useQueryStates(courseSearchParamParsers);
    const [viewParam, setViewParam] = useQueryState(COURSE_SEARCH_VIEW_KEY, searchViewParser);

    const { searchFormIsDisplayed } = deriveCourseSearchView(formData, manualSearchEnabled, viewParam);

    const showResults = useCallback(() => {
        void setViewParam(COURSE_SEARCH_VIEW.RESULTS);
    }, [setViewParam]);

    const showSearchForm = useCallback(() => {
        void setViewParam(COURSE_SEARCH_VIEW.SEARCH_FORM);
    }, [setViewParam]);

    const clearView = useCallback(() => {
        void setViewParam(null);
    }, [setViewParam]);

    return {
        viewParam,
        searchFormIsDisplayed,
        showResults,
        showSearchForm,
        clearView,
    };
}

export function useCourseSearchSubmit() {
    const [, setViewParam] = useQueryState(COURSE_SEARCH_VIEW_KEY, searchViewParser);

    const showResults = useCallback(() => {
        void setViewParam(COURSE_SEARCH_VIEW.RESULTS);
    }, [setViewParam]);

    const submitSearch = useCallback(
        (data?: CourseSearchParams) => {
            const payload = data ?? readCourseSearchParams();
            if (isValidSearch(payload)) {
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

    return {
        submitSearch,
    };
}
