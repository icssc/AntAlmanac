import { useState } from 'react'
import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
} from '@mui/material'
import {
  Add as AddIcon,
  MoreHoriz as MoreHorizIcon,
  Panorama as PanoramaIcon,
  Today as TodayIcon,
} from '@mui/icons-material'
import UndoDeleteButton from '$components/Buttons/UndoDelete'
import ClearCurrentSchedule from '$components/Buttons/ClearCurrentSchedule'
import DownloadButton from '$components/Buttons/Download'
import ScreenshotButton from '$components/Buttons/Screenshot'
import CustomEventButton from '$components/Buttons/CustomEvent'
import EditScheduleButton from '$components/Buttons/EditSchedule'
import SelectScheduleButton from '$components/Buttons/SelectSchedule'
import ToggleFinalsButton from '$components/Buttons/ToggleFinals'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   * TODO: put this in a shared store as well?
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function CalendarToolbar(props: Props) {
  const screenXs = useMediaQuery('(max-width: 750px)')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" color="transparent" sx={{ '&.MuiAppBar-root': { boxShadow: 'none' } }}>
      <Toolbar sx={{ '&.MuiToolbar-root': { padding: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 0.5 }}>
          <EditScheduleButton />
          <SelectScheduleButton />
          <ToggleFinalsButton />
        </Box>

        <Box flexGrow="1" />

        {screenXs ? (
          <>
            <UndoDeleteButton />
            <ClearCurrentSchedule />
            <IconButton onClick={handleClick}>
              <MoreHorizIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
              <DownloadButton />
              <ScreenshotButton imgRef={props.imgRef} />
              <CustomEventButton />
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 0.5 }}>
            <UndoDeleteButton />
            <ClearCurrentSchedule />
            <DownloadButton />
            <ScreenshotButton imgRef={props.imgRef} />
            <CustomEventButton />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
