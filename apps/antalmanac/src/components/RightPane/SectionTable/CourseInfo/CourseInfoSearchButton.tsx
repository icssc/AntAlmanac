import { useQuickSearch } from '$hooks/useQuickSearch';
import { Search } from '@mui/icons-material';
import { Button } from '@mui/material';
import { AACourseWithTerm } from '@packages/antalmanac-types';
import { useCallback } from 'react';

interface CourseInfoSearchButtonProps {
    course: AACourseWithTerm;
}

export function CourseInfoSearchButton({ course }: CourseInfoSearchButtonProps) {
    const quickSearch = useQuickSearch();

    const { deptCode, courseNumber, term } = course;

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
