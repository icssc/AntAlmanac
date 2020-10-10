import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Image from '@material-ui/icons/Image';
import html2canvas from 'html2canvas';

function ScreenshotButton(props) {
  const { onTakeScreenshot, closeMenu } = props;

  return (
    <Fragment>
      <Button
        style={{ width: '100%' }}
        onClick={() => {
          onTakeScreenshot(() => {
            html2canvas(document.getElementById('screenshot'), {
              scale: 2.5,
            }).then((canvas) => {
              const img = canvas.toDataURL('image/png');
              const lnk = document.createElement('a');
              lnk.download = 'Schedule.png';
              lnk.href = img;

              if (document.createEvent) {
                const e = document.createEvent('MouseEvents');
                e.initMouseEvent(
                  'click',
                  true,
                  true,
                  window,
                  0,
                  0,
                  0,
                  0,
                  0,
                  false,
                  false,
                  false,
                  false,
                  0,
                  null
                );
                lnk.dispatchEvent(e);
              } else if (lnk.fireEvent) {
                lnk.fireEvent('onclick');
              }
            });
          });
          closeMenu();
        }}
      >
        <Image style={{ 'margin-right': '5px' }} />
        .png
      </Button>
    </Fragment>
  );
}

export default ScreenshotButton;
