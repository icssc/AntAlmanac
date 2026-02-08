import { DeleteOutline } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip } from '@mui/material';
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
    analyticsCategory?: AnalyticsCategory;
    disabled?: boolean;
}

export function ClearScheduleButton({ skeletonMode, buttonSx, size, fontSize, disabled }: ClearScheduleButtonProps) {
    const postHog = usePostHog();

    return (
        <Tooltip title="Clear schedule">
            <IconButton
                sx={buttonSx}
                onClick={handleClearSchedule(postHog)}
                size={size}
                disabled={skeletonMode || disabled}
            >
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}
