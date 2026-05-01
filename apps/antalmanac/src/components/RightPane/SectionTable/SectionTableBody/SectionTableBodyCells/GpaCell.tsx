import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTableBody/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSecondaryColor } from '$hooks/useSecondaryColor';
import { Grades } from '$lib/grades';
import { ButtonBase, Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
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

    return {
        gpa: '',
        instructor: namedInstructors[0] || '',
    };
}

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

export const GpaCell = ({ deptCode, courseNumber, instructors }: GpaCellProps) => {
    const isMobile = useIsMobile();
    const secondaryColor = useSecondaryColor();

    const [loading, setLoading] = useState(true);
    const [gpa, setGpa] = useState('');
    const [instructor, setInstructor] = useState('');
    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    useEffect(() => {
        setLoading(true);

        getGpaData(deptCode, courseNumber, instructors)
            .then((data) => {
                setGpa(data?.gpa);
                setInstructor(data?.instructor);
            })
            .catch(console.log)
            .finally(() => setLoading(false));
    }, [deptCode, courseNumber, instructors]);

    return (
        <TableBodyCellContainer>
            <ButtonBase
                sx={{ fontFamily: 'inherit', fontSize: 'unset', color: secondaryColor, fontWeight: 700 }}
                onClick={handleClick}
            >
                {loading ? null : gpa || 'GPA'}
            </ButtonBase>

            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <GradesPopover
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructor={instructor}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
