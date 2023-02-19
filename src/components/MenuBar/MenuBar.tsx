import { MenuList, Toolbar } from '@mui/material'
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
    <Toolbar sx={{ '&.MuiToolbar-root': { p: 0, minHeight: 0 } }}>
      <MenuList sx={{ display: 'flex' }}>
        <ScheduleMenu />
        <EditMenu />
        <CourseMenu />
        <ExportMenu {...props} />
      </MenuList>
    </Toolbar>
  )
}
