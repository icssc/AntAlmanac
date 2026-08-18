import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { EnrollmentHistoryPopover } from '$components/RightPane/SectionTable/SectionTablePopover/EnrollmentHistoryPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Box, ButtonBase, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import type { AACourseWithTerm, AASection } from '@packages/antalmanac-types';
import { useCallback, useMemo, useState } from 'react';

interface EnrollmentCellProps {
    section: AASection;
    course: AACourseWithTerm;
}

export const EnrollmentCell = ({ section, course }: EnrollmentCellProps) => {
    const isMobile = useIsMobile();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);
    const theme = useTheme();
    const secondaryColor = theme.palette.secondary.main;

    const formattedTime = useMemo(() => {
        if (!section.updatedAt) {
            return null;
        }

        const date = new Date(section.updatedAt);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const timeString = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !isMilitaryTime,
        });

        return isMilitaryTime ? timeString : timeString.replace(/^0(\d)/, '$1');
    }, [section.updatedAt, isMilitaryTime]);

    const showTooltip = !isMobile && formattedTime;
    const maxCapacity = parseInt(section.maxCapacity, 10);

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
                {section.numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
            </ButtonBase>
        ),
        [handleClick, section.numCurrentlyEnrolled.totalEnrolled, maxCapacity, secondaryColor]
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

                {section.numOnWaitlist !== '' && (
                    <Box>
                        WL: {section.numOnWaitlist} / {section.numWaitlistCap}
                    </Box>
                )}
                {section.numNewOnlyReserved !== '' && <Box>NOR: {section.numNewOnlyReserved}</Box>}
            </Box>

            <Popover
                open={Boolean(anchorEl)}
                onClose={hideEnrollmentHistory}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <EnrollmentHistoryPopover
                    sectionType={section.sectionType}
                    department={course.deptCode}
                    courseNumber={course.courseNumber}
                    term={course.term}
                    sectionCode={section.sectionCode}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
