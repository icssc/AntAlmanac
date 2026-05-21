import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { EnrollmentHistoryPopover } from '$components/RightPane/SectionTable/SectionTablePopover/EnrollmentHistoryPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { Box, ButtonBase, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import type { AATerm } from '@packages/antalmanac-types';
import type { WebsocSectionEnrollment, WebsocSectionType } from '@packages/anteater-api/types';
import { useCallback, useMemo, useState } from 'react';

interface EnrollmentCellProps {
    sectionType: WebsocSectionType;
    deptCode: string;
    courseNumber: string;
    term: AATerm;
    sectionCode: string;
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: number;

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
    sectionType,
    deptCode,
    courseNumber,
    term,
    sectionCode,
    numCurrentlyEnrolled,
    maxCapacity,
    numOnWaitlist,
    numWaitlistCap,
    numNewOnlyReserved,
    formattedTime,
}: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const secondaryColor = theme.palette.secondary.main;
    const showTooltip = !isMobile && formattedTime;

    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((current) => (current ? undefined : event.currentTarget));
    }, []);

    const hideEnrollmentHistory = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const enrollmentText = useMemo(
        () => (
            <ButtonBase
                sx={{
                    fontFamily: 'inherit',
                    fontSize: 'unset',
                    color: secondaryColor,
                    fontWeight: 700,
                }}
                onClick={handleClick}
            >
                {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
            </ButtonBase>
        ),
        [handleClick, numCurrentlyEnrolled.totalEnrolled, maxCapacity, secondaryColor]
    );

    return (
        <TableBodyCellContainer>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {showTooltip ? (
                        <Tooltip title={<Typography>Last updated at {formattedTime}</Typography>}>
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
                <EnrollmentHistoryPopover
                    sectionType={sectionType}
                    department={deptCode}
                    courseNumber={courseNumber}
                    term={term}
                    sectionCode={sectionCode}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
