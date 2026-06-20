import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseSearchForm,
    useCourseSearchMode,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { readCourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/loaders';
import type { CourseSearchMode } from '$components/RightPane/CoursePane/SearchParams/types';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { LIGHT_BLUE } from '$src/globals';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { alpha, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

export function SearchFormModeToggle() {
    const { manualSearchEnabled, setSearchMode } = useCourseSearchMode();
    const { resetForm, setFields } = useCourseSearchForm();
    const { clearView } = useCourseSearchView();
    const isDark = useIsDarkMode();
    const { savedManualSearch, saveManualSearch } = useSavedSearchStore(
        useShallow((store) => ({
            savedManualSearch: store.savedManualSearch,
            saveManualSearch: store.saveManualSearch,
        }))
    );

    const toggleSearchMode = (_event: React.MouseEvent<HTMLElement>, value: CourseSearchMode | null) => {
        if (value === null) return;

        switch (value) {
            case COURSE_SEARCH_MODE.MANUAL:
                setSearchMode(COURSE_SEARCH_MODE.MANUAL);
                if (savedManualSearch) {
                    setFields(savedManualSearch);
                }
                break;
            case COURSE_SEARCH_MODE.QUICK:
                saveManualSearch(readCourseSearchParams());
                setSearchMode(COURSE_SEARCH_MODE.QUICK);
                resetForm({ preserveTerm: true });
                clearView();
                break;
        }
    };

    return (
        <ToggleButtonGroup
            fullWidth
            size="medium"
            color="secondary"
            value={manualSearchEnabled ? COURSE_SEARCH_MODE.MANUAL : COURSE_SEARCH_MODE.QUICK}
            exclusive
            aria-label="Search selection"
            sx={{
                paddingTop: 1,
                '& .MuiToggleButton-root.Mui-selected': {
                    backgroundColor: isDark ? alpha(LIGHT_BLUE, 0.05) : undefined,
                },
            }}
            onChange={toggleSearchMode}
        >
            <ToggleButton value={COURSE_SEARCH_MODE.QUICK}>Quick Search</ToggleButton>
            <ToggleButton value={COURSE_SEARCH_MODE.MANUAL}>Manual Search</ToggleButton>
        </ToggleButtonGroup>
    );
}
