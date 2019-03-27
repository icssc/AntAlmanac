import React, {Fragment} from 'react';
import IconButton from '@material-ui/core/IconButton';
import GetApp from '@material-ui/icons/GetApp';
import html2canvas from 'html2canvas';
import Tooltip from '@material-ui/core/Tooltip';

function ScreenshotButton(props) {
  const {onTakeScreenshot} = props;

  return (
    <Fragment>
      <Tooltip title="Download Schedule">
        <IconButton
          onClick={() => {
            onTakeScreenshot(() => {
              html2canvas(document.getElementById("screenshot"), {scale: 2.5}).then((canvas) => {
                const img = canvas.toDataURL("image/png");
                const lnk = document.createElement('a');
                lnk.download = "Schedule.png";
                lnk.href = img;

                if (document.createEvent) {
                  const e = document.createEvent("MouseEvents");
                  e.initMouseEvent("click", true, true, window,
                    0, 0, 0, 0, 0, false, false, false,
                    false, 0, null);
                  lnk.dispatchEvent(e);
                } else if (lnk.fireEvent) {
                  lnk.fireEvent("onclick");
                }
              });
            });
          }}>
          <GetApp fontSize='small'/>
        </IconButton>
      </Tooltip>
    </Fragment>
  );
}

export default ScreenshotButton;
