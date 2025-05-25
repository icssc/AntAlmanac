import { Box } from '@mui/material';
import { useCallback, useEffect } from 'react';

import RightPaneStore from '../RightPaneStore';

import { CoursePaneButtonRow } from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';

import { openSnackbar } from '$actions/AppStoreActions';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { Grades } from '$lib/grades';
import { WebSOC } from '$lib/websoc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchFormIsDisplayed, displaySearch, displaySections } = useCoursePaneStore();

    const handleSearch = useCallback(() => {
        const advancedSearchEnabled = useCoursePaneStore.getState().advancedSearchEnabled;

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
    }, [displaySections, forceUpdate]);

    const refreshSearch = useCallback(() => {
        logAnalytics({
            category: analyticsEnum.classSearch.title,
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
