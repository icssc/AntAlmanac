import { Box, MenuList, Toolbar } from '@mui/material'
import ClearCurrentSchedule from '$components/Buttons/ClearSchedule'
import UndoButton from '$components/Buttons/Undo'
import RedoButton from '$components/Buttons/Redo'
import CustomEventButton from '$components/Buttons/CustomEvent'
import DownloadButton from '$components/Buttons/Download'
import ScreenshotButton from '$components/Buttons/Screenshot'
import ScheduleMenu from './Schedule'
import EditMenu from './Edit'
import ExportMenu from './Export/Export'
import CourseMenu from './Course'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   */
  imgRef: React.RefObject<HTMLElement>
}

/**
 * Ribbon: @see {@link https://en.wikipedia.org/wiki/Ribbon_(computing)}
 */
export default function Ribbon(props: Props) {
  return (
    <Toolbar sx={{ '&.MuiToolbar-root': { p: 0.5, minHeight: 0 } }}>
      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <MenuList sx={{ p: 0, display: 'flex' }} dense>
          <ScheduleMenu />
          <EditMenu />
          <CourseMenu />
          <ExportMenu {...props} />
        </MenuList>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, paddingX: 1 }}>
          <UndoButton />
          <RedoButton />
          <ClearCurrentSchedule />
          <DownloadButton />
          <ScreenshotButton {...props} iconOnly />
          <CustomEventButton iconOnly />
        </Box>
      </Box>
    </Toolbar>
  )
}
