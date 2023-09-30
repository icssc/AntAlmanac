import { useCallback, useEffect, useState } from 'react';

import RightPaneStore from '../RightPaneStore';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import SearchForm from './SearchForm/SearchForm';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { openSnackbar } from '$actions/AppStoreActions';
import { clearCache } from '$lib/course-helpers';

function RightPane() {
    // A key that's used to re-render the search results.
    const [count, setCount] = useState(0);

    // const [searchParams, setSearchParams] = useSearchParams()

    const toggleSearch = useCallback(() => {
        if (
            RightPaneStore.getFormData().ge !== 'ANY' ||
            RightPaneStore.getFormData().deptValue !== 'ALL' ||
            RightPaneStore.getFormData().sectionCode !== '' ||
            RightPaneStore.getFormData().instructor !== ''
        ) {
            RightPaneStore.toggleSearch();

            setCount((currentCount) => currentCount + 1);
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
        clearCache();
        setCount((currentCount) => currentCount + 1);
    }, []);

    useEffect(() => {
        const handleReturnToSearch = (event: KeyboardEvent) => {
            if (
                !(RightPaneStore.getDoDisplaySearch() || RightPaneStore.getOpenSpotAlertPopoverActive()) &&
                (event.key === 'Backspace' || event.key === 'Escape')
            ) {
                event.preventDefault();
                RightPaneStore.toggleSearch();
                setCount((currentCount) => currentCount + 1);
            }
        };

        document.addEventListener('keydown', handleReturnToSearch, false);

        return () => {
            document.removeEventListener('keydown', handleReturnToSearch, false);
        };
    }, []);

    return (
        <div style={{ height: '100%', padding: 8 }}>
            <CoursePaneButtonRow
                showSearch={!RightPaneStore.getDoDisplaySearch()}
                onDismissSearchResults={toggleSearch}
                onRefreshSearch={refreshSearch}
            />
            {RightPaneStore.getDoDisplaySearch() ? (
                <SearchForm toggleSearch={toggleSearch} />
            ) : (
                <CourseRenderPane key={count} />
            )}
        </div>
    );
}

export default RightPane;
