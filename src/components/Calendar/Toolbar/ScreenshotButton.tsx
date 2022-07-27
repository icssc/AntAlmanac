import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import html2canvas from 'html2canvas';
import { Panorama } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { saveAs } from 'file-saver';
import analyticsEnum, { logAnalytics } from '../../../analytics';

interface ScreenshotButtonProps {
    onTakeScreenshot: (html2CanvasScreenshot: Function)=>void // passes 
}

class ScreenshotButton extends PureComponent<ScreenshotButtonProps> {
    handleClick = () => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });
        html2canvas(document.getElementById('screenshot') as HTMLElement, {
            scale: 2.5,
        }).then((canvas) => {
            const imgRaw = canvas.toDataURL('image/png');
            saveAs(imgRaw,'Schedule.png')
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
