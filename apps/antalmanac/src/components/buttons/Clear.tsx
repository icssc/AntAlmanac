import { DeleteOutline } from '@mui/icons-material';
import { IconButton, type SxProps, Tooltip } from '@mui/material';
import { type PostHog, usePostHog } from 'posthog-js/react';

import { clearSchedules } from '$actions/AppStoreActions';
import analyticsEnum, { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';

function handleClearSchedule(postHog?: PostHog, analyticsCategory?: AnalyticsCategory) {
    return () => {
        if (window.confirm('Are you sure you want to clear this schedule?')) {
            const category = analyticsCategory ?? analyticsEnum.calendar;

            logAnalytics(postHog, {
                category: category,
                action: category.actions.CLEAR_SCHEDULE ?? '',
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
}

export function ClearScheduleButton({ skeletonMode, buttonSx, size, fontSize }: ClearScheduleButtonProps) {
    const postHog = usePostHog();

    return (
        <Tooltip title="Clear schedule">
            <IconButton sx={buttonSx} onClick={handleClearSchedule(postHog)} size={size} disabled={skeletonMode}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}
