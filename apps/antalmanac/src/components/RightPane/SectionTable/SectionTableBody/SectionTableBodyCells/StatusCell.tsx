import { SxProps, Theme } from '@mui/material';
import { WebsocSectionStatus } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

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

export const StatusCell = ({ status }: StatusCellProps) => {
    return <TableBodyCellContainer sx={SECTION_STATUS_COLORS[status]}>{status}</TableBodyCellContainer>;
};
