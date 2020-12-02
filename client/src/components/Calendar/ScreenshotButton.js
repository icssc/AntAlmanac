import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import html2canvas from 'html2canvas';
import { Panorama } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';

class ScreenshotButton extends PureComponent {
    handleClick = () => {
        html2canvas(document.getElementById('screenshot'), {
            scale: 2.5,
        }).then((canvas) => {
            const img = canvas.toDataURL('image/png');
            const lnk = document.createElement('a');
            lnk.download = 'Schedule.png';
            lnk.href = img;

            if (document.createEvent) {
                const e = document.createEvent('MouseEvents');
                e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                lnk.dispatchEvent(e);
            } else if (lnk.fireEvent) {
                lnk.fireEvent('onclick');
            }
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

ScreenshotButton.propTypes = {
    onTakeScreenshot: PropTypes.func.isRequired,
};

export default ScreenshotButton;
