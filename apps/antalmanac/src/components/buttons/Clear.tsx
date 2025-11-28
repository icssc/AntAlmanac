import { DeleteOutline } from '@mui/icons-material';
import { IconButton, IconButtonProps, IconProps, Tooltip } from '@mui/material';
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

interface ClearScheduleButtonProps extends IconButtonProps {
    fontSize?: IconProps['fontSize'];
    analyticsCategory: AnalyticsCategory;
}

export function ClearScheduleButton({
    disabled = false,
    sx,
    fontSize = 'small',
    analyticsCategory,
}: ClearScheduleButtonProps) {
    const postHog = usePostHog();

    return (
        <Tooltip title="Clear schedule">
            <IconButton sx={sx} onClick={handleClearSchedule(postHog, analyticsCategory)} disabled={disabled}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}
