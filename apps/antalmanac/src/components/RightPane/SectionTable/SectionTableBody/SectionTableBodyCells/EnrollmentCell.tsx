import { Box, Button, Popover, Tooltip, Typography } from '@mui/material';
import { WebsocSectionEnrollment } from '@packages/antalmanac-types';
import { useCallback, useState } from 'react';

import { EnrollmentHistoryPopup } from '$components/RightPane/SectionTable/EnrollmentHistoryPopup';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSecondaryColor } from '$hooks/useSecondaryColor';

interface EnrollmentCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: string | number;

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
    deptCode,
    courseNumber,
    instructors,
    numCurrentlyEnrolled,
    maxCapacity,
    numOnWaitlist,
    numWaitlistCap,
    numNewOnlyReserved,
    formattedTime,
}: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const secondaryColor = useSecondaryColor();
    const showTooltip = !isMobile && formattedTime;
    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideEnrollmentHistory = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const enrollmentText = (
        <Button
            sx={{
                paddingX: 0,
                paddingY: 0,
                minWidth: 0,
                fontWeight: 600,
                fontSize: '1rem',
                color: secondaryColor,
                lineHeight: 1.2,
            }}
            onClick={handleClick}
            variant="text"
        >
            {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
        </Button>
    );

    return (
        <TableBodyCellContainer>
            <Box>
                <Box sx={{ cursor: 'pointer' }}>
                    {showTooltip ? (
                        <Tooltip title={<Typography fontSize={'0.85rem'}>Last updated at {formattedTime}</Typography>}>
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
            <Popover
                open={Boolean(anchorEl)}
                onClose={hideEnrollmentHistory}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <EnrollmentHistoryPopup
                    department={deptCode}
                    courseNumber={courseNumber}
                    preferredInstructors={instructors}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
