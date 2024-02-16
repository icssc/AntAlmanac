import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Panorama } from '@material-ui/icons';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { useThemeStore } from '$stores/SettingsStore';

const ScreenshotButton = () => {
    const { isDark } = useThemeStore();

    const handleClick = () => {
        logAnalytics({
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
            <Button onClick={handleClick} variant="outlined" size="small" startIcon={<Panorama fontSize="small" />}>
                Screenshot
            </Button>
        </Tooltip>
    );
};

export default ScreenshotButton;
