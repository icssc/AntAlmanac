import { useCallback, useEffect, useReducer } from 'react';

import RightPaneStore from '../RightPaneStore';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import SearchForm from './SearchForm/SearchForm';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { openSnackbar } from '$actions/AppStoreActions';
import WebSOC from '$lib/websoc';
import Grades from '$lib/grades';
import useCoursePaneStore from '$stores/CoursePaneStore';

function RightPane() {
    const [key, forceUpdate] = useReducer((currentCount) => currentCount + 1, 0);
    const { searchIsDisplayed, displaySearch, displaySections } = useCoursePaneStore();

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
    }, []);

    const refreshSearch = useCallback(() => {
        logAnalytics({
            category: analyticsEnum.classSearch.title,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        WebSOC.clearCache();
        Grades.clearCache();
        forceUpdate();
    }, []);

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
    }, []);

    return (
        <div style={{ height: '100%' }}>
            <CoursePaneButtonRow
                showSearch={!searchIsDisplayed}
                onDismissSearchResults={displaySearch}
                onRefreshSearch={refreshSearch}
            />
            {searchIsDisplayed ? <SearchForm toggleSearch={handleSearch} /> : <CourseRenderPane key={key} id={key} />}
        </div>
    );
}

export default RightPane;
