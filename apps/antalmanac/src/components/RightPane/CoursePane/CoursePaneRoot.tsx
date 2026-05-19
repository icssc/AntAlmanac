import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { PLANNER_SEARCH_PARAM } from '$components/RightPane/CoursePane/SearchForm/constants';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import {
    courseSearchFormDataHasAdvancedSearch,
    courseSearchFormDataHasManualSearch,
    courseSearchFormDataHasRequiredSearchParams,
    courseSearchFormDataIsValid,
    defaultAdvancedSearchValues,
    type CourseSearchParams,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box } from '@mui/material';
import { parseAsString, useQueryState } from 'nuqs';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CoursePaneRoot() {
    const {
        key,
        forceUpdate,
        searchFormIsDisplayed,
        displaySearch,
        displaySections,
        advancedSearchEnabled,
        enableAdvancedSearch,
        disableAdvancedSearch,
        initializeSearchUi,
    } = useCoursePaneStore(
        useShallow((store) => ({
            key: store.key,
            forceUpdate: store.forceUpdate,
            searchFormIsDisplayed: store.searchFormIsDisplayed,
            displaySearch: store.displaySearch,
            displaySections: store.displaySections,
            advancedSearchEnabled: store.advancedSearchEnabled,
            enableAdvancedSearch: store.enableAdvancedSearch,
            disableAdvancedSearch: store.disableAdvancedSearch,
            initializeSearchUi: store.initializeSearchUi,
        }))
    );
    const { formData, resetAdvanced, setFields } = useCourseSearchUrlState();
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, parseAsString.withOptions({ history: 'replace' }));
    const postHog = usePostHog();
    const utils = trpcReact.useUtils();
    const hasInitializedSearchUi = useRef(false);
    const prevFormDataRef = useRef<CourseSearchParams | null>(null);

    const handleSearch = useCallback(() => {
        const nextFormData = advancedSearchEnabled ? formData : { ...formData, ...defaultAdvancedSearchValues };

        if (!advancedSearchEnabled) {
            prevFormDataRef.current = formData;
            void resetAdvanced();
        }

        if (courseSearchFormDataIsValid(nextFormData)) {
            displaySections();
            forceUpdate();
        } else {
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
        }
    }, [advancedSearchEnabled, displaySections, forceUpdate, formData, resetAdvanced]);

    const handleDisplaySearch = useCallback(() => {
        const prevFormData = prevFormDataRef.current;

        if (prevFormData) {
            void setFields(prevFormData);
            prevFormDataRef.current = null;
            if (courseSearchFormDataHasAdvancedSearch(prevFormData)) {
                enableAdvancedSearch();
            } else {
                disableAdvancedSearch();
            }
        }

        displaySearch();
    }, [disableAdvancedSearch, displaySearch, enableAdvancedSearch, setFields]);

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        utils.websoc.invalidate();
        utils.grades.invalidate();
        forceUpdate();
    }, [forceUpdate, postHog, utils]);

    const handleKeydown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleDisplaySearch();
        },
        [handleDisplaySearch]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown, false);

        return () => {
            document.removeEventListener('keydown', handleKeydown, false);
        };
    }, [handleKeydown]);

    useEffect(() => {
        if (hasInitializedSearchUi.current) {
            return;
        }

        initializeSearchUi({
            searchFormIsDisplayed:
                !courseSearchFormDataHasRequiredSearchParams(formData) || !courseSearchFormDataIsValid(formData),
            manualSearchEnabled: courseSearchFormDataHasManualSearch(formData) && plannerSearchParam === null,
            advancedSearchEnabled: courseSearchFormDataHasAdvancedSearch(formData),
        });
        hasInitializedSearchUi.current = true;
    }, [formData, initializeSearchUi, plannerSearchParam]);

    return (
        <Box sx={{ height: 0, flexGrow: 1 }}>
            <CoursePaneButtonRow
                showSearch={!searchFormIsDisplayed}
                onDismissSearchResults={handleDisplaySearch}
                onRefreshSearch={refreshSearch}
            />
            {searchFormIsDisplayed ? (
                <SearchForm toggleSearch={handleSearch} />
            ) : (
                <CourseRenderPane key={key} id={key} />
            )}
        </Box>
    );
}
