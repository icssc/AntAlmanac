import { AppBar, Box, Toolbar } from '@mui/material'
import EditScheduleButton from '$components/Buttons/EditSchedule'
import SelectScheduleButton from '$components/Buttons/SelectSchedule'
import ToggleFinalsButton from '$components/Buttons/ToggleFinals'
import MenuBar from '$components/MenuBar'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function CalendarToolbar(props: Props) {
  return (
    <AppBar position="static" color="transparent" sx={{ '&.MuiAppBar-root': { boxShadow: 'none' }, p: 1 }}>
      <MenuBar {...props} />
      <Toolbar sx={{ '&.MuiToolbar-root': { p: 0, minHeight: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 0.5 }}>
          <EditScheduleButton />
          <SelectScheduleButton />
          <ToggleFinalsButton />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
