import { clearSchedules } from '$actions/AppStoreActions';
import analyticsEnum, { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { DeleteOutline } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

interface ClearScheduleButtonProps {
    skeletonMode?: boolean;
    buttonSx?: SxProps;
    size?: 'small' | 'medium' | 'large' | undefined;
    fontSize?: 'small' | 'medium' | 'large' | 'inherit' | undefined;
    analyticsCategory?: AnalyticsCategory;
    disabled?: boolean;
}

export function ClearScheduleButton({
    skeletonMode,
    buttonSx,
    size,
    fontSize,
    analyticsCategory,
    disabled,
}: ClearScheduleButtonProps) {
    const postHog = usePostHog();

    const handleClick = useCallback(() => {
        if (!window.confirm('Are you sure you want to clear this schedule?')) return;
        const category = analyticsCategory || analyticsEnum.calendar;
        logAnalytics(postHog, {
            category,
            action: category.actions.CLEAR_SCHEDULE,
        });
        clearSchedules();
    }, [postHog, analyticsCategory]);

    return (
        <Tooltip title="Clear schedule">
            <IconButton sx={buttonSx} onClick={handleClick} size={size} disabled={skeletonMode || disabled}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}
