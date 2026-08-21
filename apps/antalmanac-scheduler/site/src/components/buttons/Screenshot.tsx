import { useIsDarkMode } from '$hooks/useIsDarkMode';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { saveAs } from '$lib/utils';
import { Panorama } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

export function ScreenshotButton() {
    const isDark = useIsDarkMode();
    const postHog = usePostHog();

    const handleClick = () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });

        setTimeout(() => {
            void (async () => {
                const element = document.getElementById('screenshot');
                if (!element) {
                    return;
                }

                const { default: html2canvas } = await import('html2canvas');
                const canvas = await html2canvas(element, {
                    scale: 2.5,
                    backgroundColor: isDark ? '#303030' : '#fafafa',
                });
                const imgRaw = canvas.toDataURL('image/png');
                saveAs(imgRaw, 'Schedule.png');
            })();
        }, 1);
    };

    return (
        <Tooltip title="Get a screenshot of your schedule">
            <IconButton onClick={handleClick} size="medium">
                <Panorama fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}
