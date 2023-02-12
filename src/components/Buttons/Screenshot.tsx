import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button, Link, Tooltip } from '@mui/material';
import { Panorama as PanoramaIcon } from '@mui/icons-material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';

interface Props {
  /**
   * provide a React ref to the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>;
}

export default function ScreenshotButton(props: Props) {
  /**
   * ref to an invisible link used to download the screenshot
   */
  const ref = useRef<HTMLAnchorElement>(null);

  async function handleClick() {
    if (!props.imgRef.current) {
      return;
    }

    /*
     * before screenshoting, make some adjustments to the calendar:
     * - set color to black; screenshot is light mode
     */

    const prevColor = props.imgRef.current.style.color;

    props.imgRef.current.style.color = 'black';

    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.SCREENSHOT,
    });

    const canvas = await html2canvas(props.imgRef.current, { scale: 2.5 });
    const imgRaw = canvas.toDataURL('image/png');
    saveAs(imgRaw, 'Schedule.png');

    props.imgRef.current.style.color = prevColor;
  }

  function saveAs(uri: string, download: string) {
    if (!ref.current) {
      return;
    }
    ref.current.href = uri;
    ref.current.download = download;
    ref.current.click();
  }

  return (
    <>
      <Tooltip title="Get a screenshot of your schedule">
        <Button onClick={handleClick} variant="outlined" size="small" startIcon={<PanoramaIcon fontSize="small" />}>
          Screenshot
        </Button>
      </Tooltip>
      <Link sx={{ display: 'none' }} ref={ref} />
    </>
  );
}
