import { SxProps, Theme } from '@mui/material';
import { WebsocSectionStatus } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

const SECTION_STATUS_COLORS: Partial<Record<WebsocSectionStatus, SxProps<Theme>>> = {
    OPEN: {
        color: '#00c853',
    },
    Waitl: {
        color: (theme) => (theme.palette.mode === 'dark' ? '#f5c518' : '#ff9800'),
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
