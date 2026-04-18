import { Box, ButtonBase, Popover, Tooltip, Typography } from "@mui/material";
import type { WebsocSectionEnrollment } from "@packages/antalmanac-types";
import { useCallback, useMemo, useState } from "react";
import { EnrollmentHistoryPopup } from "$components/RightPane/SectionTable/EnrollmentHistoryPopup";
import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import { useIsMobile } from "$hooks/useIsMobile";
import { useSecondaryColor } from "$hooks/useSecondaryColor";
import { DepartmentEnrollmentHistory, type EnrollmentHistory } from "$lib/enrollmentHistory";

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
    const secondaryColor = useSecondaryColor();
    const showTooltip = !isMobile && formattedTime;

    const [anchorEl, setAnchorEl] = useState<Element>();
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[] | null>(null);
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
                    setEnrollmentHistory(history);
                })
                .catch(() => {
                    setEnrollmentHistory(null);
                })
                .finally(() => {
                    setLoadingEnrollmentHistory(false);
                });
        },
        [anchorEl, courseNumber, deptEnrollmentHistory, enrollmentHistory, loadingEnrollmentHistory],
    );

    const hideEnrollmentHistory = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    return (
        <TableBodyCellContainer>
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {showTooltip ? (
                        <Tooltip title={<Typography>Last updated at {formattedTime}</Typography>}>
                            <ButtonBase
                                sx={{
                                    fontFamily: "inherit",
                                    fontSize: "unset",
                                    color: secondaryColor,
                                    fontWeight: 700,
                                }}
                                onClick={handleClick}
                            >
                                {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                            </ButtonBase>
                        </Tooltip>
                    ) : null}
                </Box>

                {numOnWaitlist !== "" && (
                    <Box>
                        WL: {numOnWaitlist} / {numWaitlistCap}
                    </Box>
                )}
                {numNewOnlyReserved !== "" && <Box>NOR: {numNewOnlyReserved}</Box>}
            </Box>

            <Popover
                open={Boolean(anchorEl)}
                onClose={hideEnrollmentHistory}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
