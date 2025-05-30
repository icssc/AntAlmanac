import { DeleteOutline } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';

import { clearSchedules } from '$actions/AppStoreActions';
import analyticsEnum, { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';

function handleClearSchedule(postHog?: PostHog, analyticsCategory?: AnalyticsCategory) {
    return () => {
        if (window.confirm('Are you sure you want to clear this schedule?')) {
            analyticsCategory = analyticsCategory || analyticsEnum.calendar;

            logAnalytics(postHog, {
                category: analyticsCategory,
                action: analyticsCategory.actions.CLEAR_SCHEDULE,
            });

            clearSchedules();
        }
    };
}

interface ClearScheduleButtonProps {
    skeletonMode?: boolean;
    buttonSx?: SxProps;
    size?: 'small' | 'medium' | 'large' | undefined;
    fontSize?: 'small' | 'medium' | 'large' | 'inherit' | undefined;
    dropdown: boolean;
    analyticsCategory?: AnalyticsCategory;
}

export function ClearScheduleButton({
    skeletonMode,
    buttonSx,
    size,
    fontSize,
    dropdown = false,
}: ClearScheduleButtonProps) {
    const postHog = usePostHog();

    return (
        <Tooltip title="Clear schedule" placement={dropdown ? 'right' : 'bottom'}>
            {dropdown ? (
                <MenuItem onClick={handleClearSchedule(postHog)} disabled={skeletonMode}>
                    <ListItemIcon>
                        <DeleteOutline fontSize={fontSize} />
                    </ListItemIcon>
                    <ListItemText>Clear</ListItemText>
                </MenuItem>
            ) : (
                <IconButton sx={buttonSx} onClick={handleClearSchedule(postHog)} size={size} disabled={skeletonMode}>
                    <DeleteOutline fontSize={fontSize} />
                </IconButton>
            )}
        </Tooltip>
    );
}
