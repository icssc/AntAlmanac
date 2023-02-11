import { AppBar, Toolbar } from '@mui/material';
import ScreenshotButton from '$components/Buttons/Screenshot';
import DownloadButton from '$components/Buttons/Download';
import CustomEventButton from '$components/Buttons/CustomEvent';

interface Props {
  /**
   * provide a React ref to the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>;
}

export default function CalendarToolbar(props: Props) {
  return (
    <AppBar position="static" color="default">
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <ScreenshotButton imgRef={props.imgRef} />
        <DownloadButton />
        <CustomEventButton />
      </Toolbar>
    </AppBar>
  );
}
