import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSectionGpa } from '$lib/gradesSearch';
import { ButtonBase, Popover, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

export const GpaCell = ({ deptCode, courseNumber, instructors }: GpaCellProps) => {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<Element>();
    const { gpa, instructor, loading } = useSectionGpa(deptCode, courseNumber, instructors);

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
