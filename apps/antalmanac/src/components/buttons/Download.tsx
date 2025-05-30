import { Download } from '@mui/icons-material';
import { ListItemText, ListItemIcon, MenuItem, Tooltip } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { exportCalendar } from '$lib/download';

const exportCalendarEvent = (postHog?: PostHog) => {
    return () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.DOWNLOAD,
        });
        exportCalendar();
    };
};

const DownloadButton = () => {
    const postHog = usePostHog();

    return (
        <Tooltip
            title="Download Calendar as a .ics file. You can import this file to Google or Apple calendars."
            placement="right"
        >
            <MenuItem onClick={exportCalendarEvent(postHog)}>
                <ListItemIcon>
                    <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download</ListItemText>
            </MenuItem>
        </Tooltip>
    );
};

export default DownloadButton;
