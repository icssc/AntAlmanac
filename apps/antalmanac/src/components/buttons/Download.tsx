import { Download } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { type PostHog, usePostHog } from 'posthog-js/react';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { exportCalendar } from '$lib/download';

const exportCalendarEvent = (postHog?: PostHog) => {
    return () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.DOWNLOAD ?? '',
        });
        exportCalendar();
    };
};

const DownloadButton = () => {
    const postHog = usePostHog();

    return (
        <Tooltip title="Download Calendar as a .ics file. You can import this file to Google or Apple calendars.">
            <IconButton onClick={exportCalendarEvent(postHog)} size="medium">
                <Download fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default DownloadButton;
