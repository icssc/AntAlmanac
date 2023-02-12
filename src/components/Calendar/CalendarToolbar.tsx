import { useState } from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, useMediaQuery } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';

import ScreenshotButton from '$components/Buttons/Screenshot';
import DownloadButton from '$components/Buttons/Download';
import CustomEventButton from '$components/Buttons/CustomEvent';
import EditScheduleButton from '$components/Buttons/EditSchedule';
import SelectScheduleButton from '$components/Buttons/SelectSchedule';

interface Props {
  /**
   * provide a React ref to the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>;
}

export default function CalendarToolbar(props: Props) {
  const screenXs = useMediaQuery('(max-width: 750px)');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <AppBar position="static" color="transparent">
      <Toolbar>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <EditScheduleButton />
          <SelectScheduleButton />
        </Box>

        <Box flexGrow="1" />

        {screenXs ? (
          <>
            <IconButton onClick={handleClick}>
              <MoreHorizIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
              <MenuItem>
                <DownloadButton />
              </MenuItem>
              <MenuItem>
                <ScreenshotButton imgRef={props.imgRef} />
              </MenuItem>
              <MenuItem>
                <CustomEventButton />
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 2, margin: 2 }}>
            <DownloadButton />
            <ScreenshotButton imgRef={props.imgRef} />
            <CustomEventButton />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
