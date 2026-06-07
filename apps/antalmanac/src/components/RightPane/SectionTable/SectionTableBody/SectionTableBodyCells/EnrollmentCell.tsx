import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { EnrollmentHistoryPopover } from '$components/RightPane/SectionTable/SectionTablePopover/EnrollmentHistoryPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { useTimeFormatStore } from '$stores/SettingsStore';
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
    updatedAt?: string | null;
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
    updatedAt,
}: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);
    const theme = useTheme();
    const secondaryColor = theme.palette.secondary.main;

    const formattedTime = useMemo(() => {
        if (!updatedAt) {
            return null;
        }

        const date = new Date(updatedAt);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const timeString = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !isMilitaryTime,
        });

        return timeString.replace(/^0(\d)/, '$1');
    }, [updatedAt, isMilitaryTime]);

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
