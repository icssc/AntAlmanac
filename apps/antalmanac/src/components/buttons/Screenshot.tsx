import { Panorama } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { usePostHog } from 'posthog-js/react';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useThemeStore } from '$stores/SettingsStore';

const ScreenshotButton = () => {
    const { isDark } = useThemeStore();
    const postHog = usePostHog();

    const handleClick = () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });

        void html2canvas(document.getElementById('screenshot') as HTMLElement, {
            scale: 2.5,
            backgroundColor: isDark ? '#303030' : '#fafafa',
        }).then((canvas) => {
            const imgRaw = canvas.toDataURL('image/png');
            saveAs(imgRaw, 'Schedule.png');
        });
    };

    return (
        <Tooltip title="Get a screenshot of your schedule">
            <IconButton onClick={handleClick} size="medium">
                <Panorama fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

export default ScreenshotButton;
