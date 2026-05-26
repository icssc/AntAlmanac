import { useCourseSearchUrl } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { useSavedSearchStore } from '$stores/SavedSearchStore';
import { Button } from '@mui/material';
import { useCallback } from 'react';

export function ManualSearchResetButton() {
    const { resetForm } = useCourseSearchUrl();
    const clearManualSearch = useSavedSearchStore((store) => store.clearManualSearch);

    const handleReset = useCallback(() => {
        clearManualSearch();
        resetForm();
    }, [clearManualSearch, resetForm]);

    return (
        <Button variant="contained" color="secondary" onClick={handleReset}>
            Reset
        </Button>
    );
}
