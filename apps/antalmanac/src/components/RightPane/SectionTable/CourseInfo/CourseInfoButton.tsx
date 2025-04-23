import { Box, Button, Paper, Popover, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useState } from 'react';

import { logAnalytics } from '$lib/analytics/analytics';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';

interface CourseInfoButtonProps {
    text: string;
    icon: React.ReactElement;
    redirectLink?: string;
    popupContent?: React.ReactElement;
    analyticsAction: string;
    analyticsCategory: string;
}

export const CourseInfoButton = ({
    text,
    icon,
    redirectLink,
    popupContent,
    analyticsAction,
    analyticsCategory,
}: CourseInfoButtonProps) => {
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const scheduleManagementWidth = useScheduleManagementStore((state) => state.scheduleManagementWidth);
    const compact =
        isMobileScreen || (scheduleManagementWidth && scheduleManagementWidth < theme.breakpoints.values.xs);

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        logAnalytics({
            category: analyticsCategory,
            action: analyticsAction,
        });

        if (redirectLink) {
            window.open(redirectLink);
            return;
        }

        if (popupContent) {
            setAnchorEl(anchorEl ? null : event.currentTarget);
        }
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <Button variant="contained" size="small" color="primary" onClick={handleClick}>
                <span style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {compact ? null : (
                        <span
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {text}
                        </span>
                    )}
                </span>
            </Button>

            {popupContent ? (
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <Paper>{popupContent}</Paper>
                </Popover>
            ) : null}
        </Box>
    );
};
