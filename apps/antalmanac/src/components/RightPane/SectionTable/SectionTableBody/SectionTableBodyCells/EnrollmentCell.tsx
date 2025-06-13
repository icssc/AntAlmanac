import { Box, Tooltip } from '@mui/material';
import { WebsocSectionEnrollment } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

interface EnrollmentCellProps {
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: string;

    /**
     * This is a string because sometimes it's "n/a"
     */
    numOnWaitlist: string;

    numWaitlistCap: string;

    /**
     * This is a string because numOnWaitlist is a string. I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens.
     */
    numNewOnlyReserved: string;
}

export const EnrollmentCell = ({
    numCurrentlyEnrolled,
    maxCapacity,
    numOnWaitlist,
    numWaitlistCap,
    numNewOnlyReserved,
}: EnrollmentCellProps) => {
    return (
        <TableBodyCellContainer>
            <Box>
                <Box>
                    <strong>
                        {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                    </strong>
                </Box>
                {numOnWaitlist !== '' && (
                    <Box>
                        WL: {numOnWaitlist} / {numWaitlistCap}
                    </Box>
                )}
                {numNewOnlyReserved !== '' && <Tooltip title="New-Only Reserved">
                    <Box>NOR: {numNewOnlyReserved}</Box>
                </Tooltip>}
            </Box>
        </TableBodyCellContainer>
    );
};
