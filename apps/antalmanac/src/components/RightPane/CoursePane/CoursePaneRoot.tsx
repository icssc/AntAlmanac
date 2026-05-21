import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { PLANNER_SEARCH_PARAM } from '$components/RightPane/CoursePane/SearchForm/constants';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import {
    courseSearchFormDataHasAdvancedSearch,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { Box } from '@mui/material';
import { parseAsString, useQueryState } from 'nuqs';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';

export function CoursePaneRoot() {
    const {
        formData,
        searchMode,
        searchFormIsDisplayed,
        showSearchForm,
        clearView,
        setSearchMode,
        resetAllPreservingTerm,
    } = useCourseSearchUrlState();
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, parseAsString.withOptions({ history: 'replace' }));
    const setAdvancedSearchEnabled = useCoursePaneStore((store) => store.setAdvancedSearchEnabled);

    const postHog = usePostHog();
    const utils = trpcReact.useUtils();
    const manualSearchEnabled = searchMode === 'manual' && plannerSearchParam === null;
    const derivedAdvancedSearchEnabled = courseSearchFormDataHasAdvancedSearch(formData);

    const handleDisplaySearch = useCallback(() => {
        if (manualSearchEnabled) {
            if (derivedAdvancedSearchEnabled) {
                setAdvancedSearchEnabled(true);
            }
            // Keep params; force form visible via view=search
            void showSearchForm();
            return;
        }

        setAdvancedSearchEnabled(false);
        void setSearchMode('quick');
        // Clear params → shouldShowSearchForm becomes true → view=null auto-derives to form
        void resetAllPreservingTerm();
        void clearView();
    }, [
        clearView,
        derivedAdvancedSearchEnabled,
        manualSearchEnabled,
        resetAllPreservingTerm,
        setAdvancedSearchEnabled,
        setSearchMode,
        showSearchForm,
    ]);

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        utils.websoc.invalidate();
        utils.grades.invalidate();
    }, [postHog, utils]);

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

    return (
        <Box sx={{ height: 0, flexGrow: 1 }}>
            <CoursePaneButtonRow
                showSearch={!searchFormIsDisplayed}
                onDismissSearchResults={handleDisplaySearch}
                onRefreshSearch={refreshSearch}
            />
            {searchFormIsDisplayed ? <SearchForm /> : <CourseRenderPane />}
        </Box>
    );
}
