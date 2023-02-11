import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button, Link, Tooltip } from '@mui/material';
import { Panorama as PanoramaIcon } from '@mui/icons-material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';

interface Props {
  /**
   * provide a React ref to the element to screenshot
   */
  ref: React.RefObject<HTMLElement>;
}

export default function ScreenshotButton(props: Props) {
  /**
   * ref to an invisible link used to download the screenshot
   */
  const ref = useRef<HTMLAnchorElement>(null);

  async function handleClick() {
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.SCREENSHOT,
    });
    const canvas = await html2canvas(props.ref.current, { scale: 2.5 });
    const imgRaw = canvas.toDataURL('image/png');
    saveAs(imgRaw, 'Schedule.png');
  }

  function saveAs(uri: string, download: string) {
    ref.current.href = uri;
    ref.current.download = download;
    ref.current.click();
  }

  return (
    <Tooltip title="Get a screenshot of your schedule">
      <Button onClick={handleClick} variant="outlined" size="small" startIcon={<PanoramaIcon fontSize="small" />}>
        Screenshot
        <Link sx={{ display: 'none' }} ref={ref} />
      </Button>
    </Tooltip>
  );
}
