import { Search } from '@material-ui/icons';
import { Button } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

/**
 * Routes the user to the corresponding search result
 */
export function CourseInfoSearchButton({ courseDetails, term }: { courseDetails: AACourse; term: string }) {
    const { setActiveTab } = useTabStore();
    const { displaySections } = useCoursePaneStore();

    const { deptCode, courseNumber } = courseDetails;

    const handleClick = useCallback(() => {
        RightPaneStore.updateFormValue('deptValue', deptCode);
        RightPaneStore.updateFormValue('courseNumber', courseNumber);
        RightPaneStore.updateFormValue('term', term);

        displaySections();
        setActiveTab(1);
    }, []);

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
