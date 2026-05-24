import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpc';
import { getCachedGradeDistribution, isDepartmentBulkLoaded } from '$lib/prefetchSearchGrades';
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
    const utils = trpcReact.useUtils();
    const [anchorEl, setAnchorEl] = useState<Element>();

    const namedInstructors = useMemo(() => instructors.filter((i) => i !== 'STAFF'), [instructors]);
    const deptBulkLoaded = isDepartmentBulkLoaded(utils, deptCode);

    const cachedDistributions = useMemo(
        () =>
            namedInstructors.map((instructor) => getCachedGradeDistribution(utils, deptCode, courseNumber, instructor)),
        [courseNumber, deptCode, namedInstructors, utils]
    );

    const instructorResults = trpcReact.useQueries((t) =>
        namedInstructors.map((instructor) =>
            t.grades.aggregateGrades(
                { department: deptCode, courseNumber, instructor },
                {
                    enabled: !deptBulkLoaded,
                    select: (data) => data?.gradeDistribution ?? null,
                }
            )
        )
    );

    const loading = !deptBulkLoaded && instructorResults.some((result) => result.isLoading);

    const { gpa, instructor } = useMemo(() => {
        for (let index = 0; index < namedInstructors.length; index++) {
            const distribution = cachedDistributions[index] ?? instructorResults[index]?.data;
            if (distribution?.averageGPA != null) {
                return {
                    gpa: distribution.averageGPA.toFixed(2),
                    instructor: namedInstructors[index],
                };
            }
        }

        return { gpa: '', instructor: namedInstructors[0] ?? '' };
    }, [cachedDistributions, instructorResults, namedInstructors]);

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
