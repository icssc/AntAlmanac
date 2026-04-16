import { EnrollmentHistoryPopup } from '$components/RightPane/SectionTable/EnrollmentHistoryPopup';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';
import { DepartmentEnrollmentHistory, EnrollmentHistory } from '$lib/enrollmentHistory';
import { Box, Button, Popover, Tooltip, Typography } from '@mui/material';
import { WebsocSectionEnrollment } from '@packages/antalmanac-types';
import { useCallback, useMemo, useState } from 'react';

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
    numCurrentlyEnrolled,
    maxCapacity,
    numOnWaitlist,
    numWaitlistCap,
    numNewOnlyReserved,
    formattedTime,
}: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const showTooltip = !isMobile && formattedTime;
    const [anchorEl, setAnchorEl] = useState<Element>();
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[] | null>();
    const [loadingEnrollmentHistory, setLoadingEnrollmentHistory] = useState(false);
    const deptEnrollmentHistory = useMemo(() => new DepartmentEnrollmentHistory(deptCode), [deptCode]);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            const openingPopover = !anchorEl;
            setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
            if (!openingPopover || enrollmentHistory !== undefined || loadingEnrollmentHistory) {
                return;
            }

            setLoadingEnrollmentHistory(true);
            deptEnrollmentHistory
                .find(courseNumber)
                .then((history) => {
                    setEnrollmentHistory(history ?? null);
                })
                .catch(() => {
                    setEnrollmentHistory(null);
                })
                .finally(() => {
                    setLoadingEnrollmentHistory(false);
                });
        },
        [anchorEl, courseNumber, deptEnrollmentHistory, enrollmentHistory, loadingEnrollmentHistory]
    );

    const hideEnrollmentHistory = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const enrollmentText = (
        <Button
            sx={{
                paddingX: 0,
                paddingY: 0,
                minWidth: 0,
                fontWeight: 400,
                fontSize: '1rem',
                color: (theme) => theme.palette.secondary.main,
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
                    enrollmentHistory={enrollmentHistory}
                    loading={loadingEnrollmentHistory && enrollmentHistory === undefined}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
