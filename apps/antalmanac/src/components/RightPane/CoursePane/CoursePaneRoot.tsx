import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpcReact';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchFormIsDisplayed, displaySearch, displaySections, advancedSearchEnabled } =
        useCoursePaneStore();
    const { formData } = useCourseSearchUrlState();
    const postHog = usePostHog();
    const utils = trpcReact.useUtils();

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
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
        }
    }, [advancedSearchEnabled, displaySections, forceUpdate]);

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
            if (event.key === 'Escape') displaySearch();
        },
        [displaySearch]
    );

    useEffect(() => {
        RightPaneStore.setFormData(formData);
    }, [formData]);

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
