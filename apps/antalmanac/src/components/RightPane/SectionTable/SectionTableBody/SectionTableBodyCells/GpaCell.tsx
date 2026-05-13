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

    const namedInstructors = useMemo(() => instructors.filter((i) => i !== 'STAFF'), [instructors]);

    const instructorResults = trpcReact.useQueries((t) =>
        namedInstructors.map((instructor) =>
            t.grades.aggregateGrades(
                { department: deptCode, courseNumber, instructor },
                { select: (data) => data?.gradeDistribution ?? null }
            )
        )
    );

    const loading = instructorResults.some((r) => r.isLoading);

    const { gpa, instructor } = useMemo(() => {
        const idx = instructorResults.findIndex((r) => r.data?.averageGPA != null);
        if (idx >= 0) {
            const avg = instructorResults[idx].data?.averageGPA;
            return { gpa: avg ? avg.toFixed(2) : '', instructor: namedInstructors[idx] };
        }
        return { gpa: '', instructor: namedInstructors[0] ?? '' };
    }, [instructorResults, namedInstructors]);

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
                    instructor={instructor}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
