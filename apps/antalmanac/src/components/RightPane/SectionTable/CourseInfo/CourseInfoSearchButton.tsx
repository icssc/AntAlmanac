import { Search } from '@material-ui/icons';
import { Button } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

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

    const queryParams = {
        term: term,
        deptValue: deptCode,
        courseNumber: courseNumber,
    };

    const href = `/?${Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')}`;

    return (
        <div>
            <Button
                variant="contained"
                size="small"
                color="primary"
                style={{ minWidth: 'fit-content' }}
                to={href}
                component={Link}
                onClick={handleClick}
            >
                <Search />
            </Button>
        </div>
    );
}
