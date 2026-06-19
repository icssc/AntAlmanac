import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useThemeStore } from '$stores/SettingsStore';
import { Panorama } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { saveAs } from 'file-saver';
import { usePostHog } from 'posthog-js/react';

interface ScreenshotButtonProps {
    onScreenshot?: () => void;
}

export function ScreenshotButton({ onScreenshot }: ScreenshotButtonProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();

    const handleClick = () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });

        onScreenshot?.();

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
