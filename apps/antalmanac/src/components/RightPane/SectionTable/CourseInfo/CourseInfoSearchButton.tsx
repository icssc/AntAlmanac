import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { Search } from '@material-ui/icons';
import { Button } from '@mui/material';
import { AACourse } from '@packages/antalmanac-types';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

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

    return (
        <div>
            <Button
                variant="contained"
                size="small"
                color="primary"
                style={{ minWidth: 'fit-content' }}
                to={`/?term=${term}&deptValue=${deptCode}&courseNumber=${courseNumber}`}
                component={Link}
                onClick={handleClick}
            >
                <Search />
            </Button>
        </div>
    );
}
