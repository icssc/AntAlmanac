import { Button, Popover } from '@mui/material';
import { useCallback, useState } from 'react';

import GradesPopup from '$components/RightPane/SectionTable/GradesPopup';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSecondaryColor } from '$hooks/useSecondaryColor';
import { Grades } from '$lib/grades';

export async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
    const namedInstructors = instructors.filter((instructor) => instructor !== 'STAFF');

    // Get the GPA of the first instructor of this section where data exists
    for (const instructor of namedInstructors) {
        const grades = await Grades.queryGrades(deptCode, courseNumber, instructor, false);
        if (grades?.averageGPA) {
            return {
                gpa: grades.averageGPA.toFixed(2).toString(),
                instructor: instructor,
            };
        }
    }

    return undefined;
}

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    gpa?: string;
    gpaInstructor?: string;
}

export const GpaCell = ({ deptCode, courseNumber, gpa, gpaInstructor }: GpaCellProps) => {
    const isMobile = useIsMobile();
    const secondaryColor = useSecondaryColor();

    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    return (
        <TableBodyCellContainer>
            <Button
                sx={{
                    paddingX: 0,
                    paddingY: 0,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: '1rem',
                    color: secondaryColor,
                }}
                onClick={handleClick}
                variant="text"
            >
                {gpa ?? ''}
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <GradesPopup
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructor={gpaInstructor ?? ''}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
