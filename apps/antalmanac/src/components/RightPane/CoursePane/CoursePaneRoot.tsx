import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { Grades } from '$lib/grades';
import { WebSOC } from '$lib/websoc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchFormIsDisplayed, displaySearch, displaySections, advancedSearchEnabled } =
        useCoursePaneStore();
    const postHog = usePostHog();

    const handleSearch = useCallback(() => {
        if (!advancedSearchEnabled) {
            RightPaneStore.storePrevFormData();
            RightPaneStore.resetAdvancedSearchValues();
        }

        if (RightPaneStore.formDataIsValid()) {
            displaySections();
            forceUpdate();
        } else {
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Course Code/Range, or Instructor`
            );
        }
    }, [advancedSearchEnabled, displaySections, forceUpdate]);

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        WebSOC.clearCache();
        Grades.clearCache();
        forceUpdate();
    }, [forceUpdate]);

    const handleKeydown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') displaySearch();
        },
        [displaySearch]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown, false);

        return () => {
            document.removeEventListener('keydown', handleKeydown, false);
        };
    }, [handleKeydown]);

    return (
        <Box height={'0px'} flexGrow={1}>
            <CoursePaneButtonRow
                showSearch={!searchFormIsDisplayed}
                onDismissSearchResults={displaySearch}
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
