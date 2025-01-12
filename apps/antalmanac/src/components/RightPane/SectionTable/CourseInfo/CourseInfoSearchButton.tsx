import { Button } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { AACourse } from '@packages/antalmanac-types';
import { useCallback } from 'react';

import { useQuickSearchForClasses } from '$lib/helpers';

/**
 * Routes the user to the corresponding search result
 */
export function CourseInfoSearchButton({ courseDetails, term }: { courseDetails: AACourse; term: string }) {
    const quickSearch = useQuickSearchForClasses();

    const { deptCode, courseNumber } = courseDetails;

    const handleClick = useCallback(() => {
        quickSearch(deptCode, courseNumber, term);
    }, [courseNumber, deptCode, term]);

    return (
        <div>
            <Button
                variant="contained"
                size="small"
                color="primary"
                style={{ minWidth: 'fit-content' }}
                onClick={handleClick}
            >
                <Search />
            </Button>
        </div>
    );
}
