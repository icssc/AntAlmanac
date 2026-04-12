import { Box } from '@mui/material';
import { useQueryStates } from 'nuqs';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';

import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import { usePlannerRoadmaps } from '$hooks/usePlanner';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { Grades } from '$lib/grades';
import { searchParsers, formDataIsValid, getDefaultFormValues } from '$lib/searchParams';
import { WebSOC } from '$lib/websoc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchFormIsDisplayed, displaySearch, displaySections } = useCoursePaneStore();
    const postHog = usePostHog();
    usePlannerRoadmaps();

    const [formData, setFormData] = useQueryStates(searchParsers);

    const handleSearch = useCallback(() => {
        if (formDataIsValid(formData)) {
            displaySections();
            forceUpdate();
        } else {
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
        }
    }, [displaySections, forceUpdate, formData]);

    const handleDisplaySearch = useCallback(() => {
        if (formData.mode === 'quick') {
            setFormData({ ...getDefaultFormValues(), mode: 'quick', term: formData.term });
        }
        displaySearch();
    }, [displaySearch, setFormData, formData]);

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        WebSOC.clearCache();
        Grades.clearCache();
        forceUpdate();
    }, [forceUpdate, postHog]);

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
            {searchFormIsDisplayed ? (
                <SearchForm toggleSearch={handleSearch} />
            ) : (
                <CourseRenderPane key={key} id={key} />
            )}
        </Box>
    );
}
