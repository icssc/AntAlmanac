import { Box, Tooltip, Typography } from '@mui/material';
import { WebsocSectionEnrollment } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';

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
    formattedTime: string | null;
}

export const EnrollmentCell = ({
    numCurrentlyEnrolled,
    maxCapacity,
    numOnWaitlist,
    numWaitlistCap,
    numNewOnlyReserved,
    formattedTime,
}: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const showTooltip = !isMobile && formattedTime;
    const enrollmentText = (
        <Box component="span">
            <strong>
                {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
            </strong>
        </Box>
    );

    return (
        <TableBodyCellContainer>
            <Box>
                <Box>
                    {showTooltip ? (
                        <Tooltip title={<Typography fontSize={'small'}>Last updated at {formattedTime}</Typography>}>
                            {enrollmentText}
                        </Tooltip>
                    ) : (
                        enrollmentText
                    )}
                </Box>
                {numOnWaitlist !== '' && (
                    <Box>
                        WL: {numOnWaitlist} / {numWaitlistCap}
                    </Box>
                )}
                {numNewOnlyReserved !== '' && <Box>NOR: {numNewOnlyReserved}</Box>}
            </Box>
        </TableBodyCellContainer>
    );
};
