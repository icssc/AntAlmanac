import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Panorama } from '@material-ui/icons';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { PureComponent } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { useThemeStore } from '$stores/SettingsStore';

class ScreenshotButton extends PureComponent {
    handleClick = () => {
        const isDark = useThemeStore((store) => store.isDark);
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

    render() {
        return (
            <Tooltip title="Get a screenshot of your schedule">
                <Button
                    onClick={this.handleClick}
                    variant="outlined"
                    size="small"
                    startIcon={<Panorama fontSize="small" />}
                >
                    Screenshot
                </Button>
            </Tooltip>
        );
    }
}

export default ScreenshotButton;
