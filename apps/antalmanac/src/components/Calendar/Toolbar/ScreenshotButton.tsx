import { PureComponent } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Button, Tooltip } from '@mui/material';
import { Panorama } from '@mui/icons-material';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

interface ScreenshotButtonProps {
    onTakeScreenshot: (html2CanvasScreenshot: () => void) => void; // the function in an ancestor component that wraps ScreenshotButton.handleClick to perform canvas transformations before and after downloading the screenshot.
}

class ScreenshotButton extends PureComponent<ScreenshotButtonProps> {
    handleClick = () => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });
        void html2canvas(document.getElementById('screenshot') as HTMLElement, {
            scale: 2.5,
        }).then((canvas) => {
            const imgRaw = canvas.toDataURL('image/png');
            saveAs(imgRaw, 'Schedule.png');
        });
    };

    render() {
        return (
            <Tooltip title="Get a screenshot of your schedule">
                <Button
                    onClick={() => this.props.onTakeScreenshot(this.handleClick)}
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
