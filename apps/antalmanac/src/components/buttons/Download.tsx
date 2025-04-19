import { Download } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';

import { exportCalendar } from '$lib/download';

const exportCalendarEvent = (posthog?: PostHog) => {
    return () => {
        exportCalendar(posthog);
    };
};

const DownloadButton = () => {
    const posthog = usePostHog();

    return (
        <Tooltip title="Download Calendar as a .ics file. You can import this file to Google or Apple calendars.">
            <IconButton onClick={exportCalendarEvent(posthog)} size="medium">
                <Download fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default DownloadButton;
