import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpc';
import { ButtonBase, Popover, useTheme } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

function formatGpa(averageGPA: number | null | undefined): string {
    if (averageGPA == null) {
        return '';
    }
    return averageGPA.toFixed(2);
}

export const GpaCell = ({ deptCode, courseNumber, instructors }: GpaCellProps) => {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const utils = trpcReact.useUtils();
    const [anchorEl, setAnchorEl] = useState<Element>();

    const namedInstructors = useMemo(() => instructors.filter((i) => i !== 'STAFF'), [instructors]);

    const cachedMatch = useMemo(() => {
        for (const instructor of namedInstructors) {
            const cached = utils.grades.aggregateGrades.getData({
                department: deptCode,
                courseNumber,
                instructor,
            });
            if (cached?.gradeDistribution?.averageGPA != null) {
                return { instructor, gpa: formatGpa(cached.gradeDistribution.averageGPA) };
            }
        }
        return null;
    }, [courseNumber, deptCode, namedInstructors, utils]);

    const fallbackInstructor = namedInstructors[0] ?? '';

    const { data: fetchedGrades, isLoading } = trpcReact.grades.aggregateGrades.useQuery(
        { department: deptCode, courseNumber, instructor: fallbackInstructor },
        {
            enabled: !cachedMatch && !!fallbackInstructor,
            select: (data) => data?.gradeDistribution ?? null,
        }
    );

    const gpa = cachedMatch?.gpa ?? formatGpa(fetchedGrades?.averageGPA);
    const instructor = cachedMatch?.instructor ?? fallbackInstructor;
    const loading = !cachedMatch && isLoading;

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
