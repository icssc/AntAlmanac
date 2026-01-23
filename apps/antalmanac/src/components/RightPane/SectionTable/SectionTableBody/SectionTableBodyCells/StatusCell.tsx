import type { SxProps } from '@mui/material';
import type { WebsocSectionStatus } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

const SECTION_STATUS_COLORS: Partial<Record<WebsocSectionStatus, SxProps>> = {
    OPEN: {
        color: '#00c853',
    },
    Waitl: {
        color: '#1c44b2',
    },
    FULL: {
        color: '#e53935',
    },
};

interface StatusCellProps {
    status: WebsocSectionStatus;
}

export const StatusCell = ({ status }: StatusCellProps) => {
    return <TableBodyCellContainer sx={SECTION_STATUS_COLORS[status]}>{status}</TableBodyCellContainer>;
};
