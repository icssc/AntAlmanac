import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { SxProps, Theme } from '@mui/material';
import { WebsocSectionStatus } from '@packages/anteater-api/types';
import { memo } from 'react';

const SECTION_STATUS_COLORS: Partial<Record<WebsocSectionStatus, SxProps<Theme>>> = {
    OPEN: {
        color: (theme) => theme.palette.enrollmentStatus.open,
    },
    Waitl: {
        color: (theme) => theme.palette.enrollmentStatus.waitlist,
    },
    FULL: {
        color: (theme) => theme.palette.enrollmentStatus.full,
    },
};

interface StatusCellProps {
    status: WebsocSectionStatus;
}

export const StatusCell = memo(function StatusCell({ status }: StatusCellProps) {
    return <TableBodyCellContainer sx={SECTION_STATUS_COLORS[status]}>{status}</TableBodyCellContainer>;
});

StatusCell.displayName = 'StatusCell';
