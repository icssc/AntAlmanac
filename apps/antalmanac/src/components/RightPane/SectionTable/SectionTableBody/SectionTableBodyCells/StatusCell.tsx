import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { type SxProps, type Theme } from '@mui/material';
import type { AASection } from '@packages/antalmanac-types';
import { type WebsocSectionStatus } from '@packages/anteater-api/types';

const SECTION_STATUS_COLORS: Partial<Record<WebsocSectionStatus, SxProps<Theme>>> = {
    OPEN: {
        color: (theme) => theme.vars.palette.enrollmentStatus.open,
    },
    Waitl: {
        color: (theme) => theme.vars.palette.enrollmentStatus.waitlist,
    },
    FULL: {
        color: (theme) => theme.vars.palette.enrollmentStatus.full,
    },
};

interface StatusCellProps {
    section: AASection;
}

export const StatusCell = ({ section }: StatusCellProps) => {
    const { status } = section;
    return <TableBodyCellContainer sx={SECTION_STATUS_COLORS[status]}>{status}</TableBodyCellContainer>;
};
