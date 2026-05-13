import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpcReact';
import { ButtonBase, Popover, useTheme } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

export const GpaCell = ({ deptCode, courseNumber, instructors }: GpaCellProps) => {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<Element>();

    const firstNamedInstructor = useMemo(() => instructors.find((i) => i !== 'STAFF') ?? '', [instructors]);

    const { data: grades, isLoading: loading } = trpcReact.grades.aggregateGrades.useQuery(
        { department: deptCode, courseNumber, instructor: firstNamedInstructor },
        { select: (data) => data?.gradeDistribution ?? null }
    );
    const gpa = grades?.averageGPA ? grades.averageGPA.toFixed(2) : '';

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((current) => (current ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    return (
        <TableBodyCellContainer>
            <ButtonBase
                sx={{
                    fontFamily: 'inherit',
                    fontSize: 'unset',
                    color: theme.palette.secondary.main,
                    fontWeight: 700,
                }}
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
                    instructor={firstNamedInstructor}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
