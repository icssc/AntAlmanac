import { Box } from '@mui/material';
import { useCallback, useEffect } from 'react';

import RightPaneStore from '../RightPaneStore';

import { CoursePaneButtonRow } from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import SearchForm from './SearchForm/SearchForm';

import { openSnackbar } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { Grades } from '$lib/grades';
import { WebSOC } from '$lib/websoc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useQuickClassStore } from '$stores/QuickClassStore';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchIsDisplayed, displaySearch, displaySections } = useCoursePaneStore();

    const handleSearch = useCallback(() => {
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

    useQuickClassStore.subscribe((state) => {
        const decomp = state.value;
        RightPaneStore.updateFormValue('deptLabel', decomp.deptLabel);
        RightPaneStore.updateFormValue('deptValue', decomp.deptValue);
        RightPaneStore.updateFormValue('courseNumber', decomp.courseNumber);
        handleSearch();
    });

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
        <Box height={'0px'} flexGrow={1} marginX={0.5}>
            <CoursePaneButtonRow
                showSearch={!searchIsDisplayed}
                onDismissSearchResults={displaySearch}
                onRefreshSearch={refreshSearch}
            />
            {searchIsDisplayed ? <SearchForm toggleSearch={handleSearch} /> : <CourseRenderPane key={key} id={key} />}
        </Box>
    );
}
