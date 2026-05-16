import { useQuickSearch } from '$src/hooks/useQuickSearch';
import { Search } from '@mui/icons-material';
import { Button } from '@mui/material';
import { AACourse, AATerm } from '@packages/antalmanac-types';
import { useCallback } from 'react';

interface CourseInfoSearchButtonProps {
    courseDetails: AACourse;
    term: AATerm;
}

export function CourseInfoSearchButton({ courseDetails, term }: CourseInfoSearchButtonProps) {
    const quickSearch = useQuickSearch();

    const { deptCode, courseNumber } = courseDetails;

    const handleClick = useCallback(() => {
        quickSearch(deptCode, courseNumber, term);
    }, [courseNumber, deptCode, quickSearch, term]);

    return (
        <Button
            variant="contained"
            size="small"
            color="primary"
            style={{ minWidth: 'fit-content' }}
            onClick={handleClick}
        >
            <Search />
        </Button>
    );
}
