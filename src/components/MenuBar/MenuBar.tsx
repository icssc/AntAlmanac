import { Box, IconButton, MenuList, Toolbar, Tooltip } from '@mui/material'
import { Add as AddIcon, Download as DownloadIcon, Print as PrintIcon, Redo as RedoIcon, Undo as UndoIcon } from '@mui/icons-material'
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

export default function MenuBar(props: Props) {
  return (
    <Toolbar sx={{ '&.MuiToolbar-root': { p: 0.5, minHeight: 0 } }}>
      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <MenuList sx={{ p: 0, display: 'flex' }} dense>
          <ScheduleMenu />
          <EditMenu />
          <CourseMenu />
          <ExportMenu {...props} />
        </MenuList>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title="Undo (Ctrl+Z)">
            <IconButton size="small">
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <IconButton size="small">
              <RedoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Custom Event">
            <IconButton size="small">
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Schedule (.ics)">
            <IconButton size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Toolbar>
  )
}
