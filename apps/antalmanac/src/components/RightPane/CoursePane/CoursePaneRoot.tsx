import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseSearchForm,
    useCourseSearchMode,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';

export function CoursePaneRoot() {
    const { manualSearchEnabled, setSearchMode } = useCourseSearchMode();
    const { searchFormIsDisplayed, showSearchForm, clearView } = useCourseSearchView();
    const { resetForm } = useCourseSearchForm();

    const postHog = usePostHog();
    const utils = trpcReact.useUtils();

    const handleDisplaySearch = useCallback(() => {
        if (manualSearchEnabled) {
            showSearchForm();
            return;
        }

        setSearchMode(COURSE_SEARCH_MODE.QUICK);
        resetForm({ preserveTerm: true });
        clearView();
    }, [clearView, manualSearchEnabled, resetForm, setSearchMode, showSearchForm]);

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
