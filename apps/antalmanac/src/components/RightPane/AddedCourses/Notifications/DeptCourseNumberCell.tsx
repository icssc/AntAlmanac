import { Box, SxProps } from '@mui/material';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

interface DeptCourseNumberCellProps {
    deptCode?: string;
    courseNumber?: string;
    sx?: SxProps;
}

export const DeptCourseNumberCell = ({ deptCode, courseNumber, sx }: DeptCourseNumberCellProps) => {
    const displayText = deptCode && courseNumber ? `${deptCode} ${courseNumber}` : '';

    return (
        <TableBodyCellContainer sx={sx}>
            <Box>{displayText}</Box>
        </TableBodyCellContainer>
    );
};
