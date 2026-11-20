import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { ButtonBase, Popover, Tooltip } from '@mui/material';
import type { AACourseWithTerm, AASection } from '@packages/antalmanac-types';
import { useCallback, useState } from 'react';

interface GpaCellProps {
    section: AASection;
    course: AACourseWithTerm;
}

export const GpaCell = ({ section, course }: GpaCellProps) => {
    const { deptCode, courseNumber } = course;
    const { instructors } = section;
    const isMobile = useIsMobile();
    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((current) => (current ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    return (
        <TableBodyCellContainer>
            <Tooltip
                title="Grades are only available after clicking this cell because our resources are at maximum capacity. Sorry for the inconvenience!"
                describeChild
            >
                <ButtonBase
                    sx={{
                        fontFamily: 'inherit',
                        fontSize: 'unset',
                        color: (theme) => theme.vars.palette.secondary.main,
                        fontWeight: 700,
                    }}
                    onClick={handleClick}
                >
                    GPA
                </ButtonBase>
            </Tooltip>

            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <GradesPopover
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructors={instructors}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
