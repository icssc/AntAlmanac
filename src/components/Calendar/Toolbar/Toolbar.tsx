import { AppBar, Box, Toolbar } from '@mui/material'
import SelectScheduleButton from '$components/Buttons/SelectSchedule'
import ToggleFinalsButton from '$components/Buttons/ToggleFinals'
import DeleteScheduleButton from '$components/Buttons/DeleteSchedule'
import RenameScheduleButton from '$components/Buttons/RenameSchedule'
import Ribbon from '$components/Ribbon'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function CalendarToolbar(props: Props) {
  return (
    <AppBar position="static" color="transparent" sx={{ '&.MuiAppBar-root': { boxShadow: 'none' }, p: 1 }}>
      <Ribbon {...props} />
      <Toolbar sx={{ '&.MuiToolbar-root': { p: 0, minHeight: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
          <RenameScheduleButton />
          <DeleteScheduleButton />
          <SelectScheduleButton />
          <ToggleFinalsButton />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
