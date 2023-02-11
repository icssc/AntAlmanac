import { AppBar, Toolbar } from '@mui/material';
import ScreenshotButton from '$components/Buttons/Screenshot';

export default function ActionsBar() {
  return (
    <AppBar position="static">
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <ScreenshotButton />
      </Toolbar>
    </AppBar>
  );
}
