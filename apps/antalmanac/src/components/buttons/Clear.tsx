import { clearSchedules } from '$actions/AppStoreActions';
import analyticsEnum, { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { DeleteOutline } from '@mui/icons-material';
import { IconButton, type SxProps, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

interface ClearScheduleButtonProps {
    buttonSx?: SxProps;
    size?: 'small' | 'medium' | 'large' | undefined;
    fontSize?: 'small' | 'medium' | 'large' | 'inherit' | undefined;
    analyticsCategory?: AnalyticsCategory;
}

export function ClearScheduleButton({ buttonSx, size, fontSize, analyticsCategory }: ClearScheduleButtonProps) {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
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
            <IconButton sx={buttonSx} onClick={handleClick} size={size} disabled={fallbackMode}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}
