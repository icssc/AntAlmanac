import { CourseRenderPane } from '$components/RightPane/CoursePane/CourseRenderPane/CourseRenderPane';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseSearchForm,
    useCourseSearchMode,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Box } from '@mui/material';
import { useCallback, useEffect } from 'react';

export function CoursePaneRoot() {
    const { manualSearchEnabled, setSearchMode } = useCourseSearchMode();
    const { searchFormIsDisplayed, showSearchForm, clearView } = useCourseSearchView();
    const { resetForm } = useCourseSearchForm();

    const handleDisplaySearch = useCallback(() => {
        if (manualSearchEnabled) {
            showSearchForm();
            return;
        }

        setSearchMode(COURSE_SEARCH_MODE.QUICK);
        resetForm({ preserveTerm: true });
        clearView();
    }, [clearView, manualSearchEnabled, resetForm, setSearchMode, showSearchForm]);

    const handleKeydown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleDisplaySearch();
            }
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
            {searchFormIsDisplayed ? <SearchForm /> : <CourseRenderPane onDismissSearchResults={handleDisplaySearch} />}
        </Box>
    );
}
