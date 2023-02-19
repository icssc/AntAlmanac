import { useState } from 'react'
import {
  AppBar,
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  CloudDownload as CloudDownloadIcon,
  Download as DownloadIcon,
  Panorama as PanoramaIcon,
  PostAdd as PostAddIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Undo as UndoIcon,
} from '@mui/icons-material'
import EditScheduleButton from '$components/Buttons/EditSchedule'
import SelectScheduleButton from '$components/Buttons/SelectSchedule'
import ToggleFinalsButton from '$components/Buttons/ToggleFinals'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function CalendarToolbar(_props: Props) {
  const [el1, setEl1] = useState<HTMLElement>()
  const [el2, setEl2] = useState<HTMLElement>()
  const [el3, setEl3] = useState<HTMLElement>()
  const [el4, setEl4] = useState<HTMLElement>()

  function handleClick(handler: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>) {
    return (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.stopPropagation()
      handler(e.currentTarget)
    }
  }

  function handleClose(handler: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>) {
    return (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      e.stopPropagation()
      handler(undefined)
    }
  }

  return (
    <AppBar position="static" color="transparent" sx={{ '&.MuiAppBar-root': { boxShadow: 'none' }, p: 1 }}>
      <Toolbar sx={{ '&.MuiToolbar-root': { p: 0, minHeight: 0 } }}>
        <MenuList sx={{ display: 'flex' }}>
          <MenuItem onClick={handleClick(setEl1)} disableRipple>
            <ListItemText>Schedule</ListItemText>
            <Menu anchorEl={el1} open={!!el1} onClose={handleClose(setEl1)} transitionDuration={0}>
              <MenuItem onClick={handleClose(setEl1)} sx={{ width: 200 }}>
                <ListItemIcon>
                  <PostAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Import</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose(setEl1)}>
                <ListItemIcon>
                  <SaveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Save</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose(setEl1)}>
                <ListItemIcon>
                  <CloudDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Load</ListItemText>
              </MenuItem>
            </Menu>
          </MenuItem>
          <MenuItem onClick={handleClick(setEl2)} disableRipple>
            <ListItemText>Edit</ListItemText>
            <Menu anchorEl={el2} open={!!el2} onClose={handleClose(setEl2)} transitionDuration={0}>
              <MenuItem onClick={handleClose(setEl2)} sx={{ width: 200 }}>
                <ListItemIcon>
                  <UndoIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Undo</ListItemText>
                <Typography variant="body2">⌘+Z</Typography>
              </MenuItem>
              <MenuItem onClick={handleClose(setEl2)}>
                <ListItemIcon>
                  <RedoIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Redo</ListItemText>
                <Typography variant="body2">⌘+Shift+Z</Typography>
              </MenuItem>
            </Menu>
          </MenuItem>
          <MenuItem onClick={handleClick(setEl3)} disableRipple>
            <ListItemText>Course</ListItemText>
            <Menu anchorEl={el3} open={!!el3} onClose={handleClose(setEl3)} transitionDuration={0}>
              <MenuItem onClick={handleClose(setEl3)}>Remove All Courses</MenuItem>
              <MenuItem onClick={handleClose(setEl3)}>Copy Courses to Schedule</MenuItem>
            </Menu>
          </MenuItem>
          <MenuItem onClick={handleClick(setEl4)} disableRipple>
            <ListItemText>Export</ListItemText>
            <Menu anchorEl={el4} open={!!el4} onClose={handleClose(setEl4)} transitionDuration={0}>
              <MenuItem onClick={handleClose(setEl4)}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download (.ics)</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose(setEl4)}>
                <ListItemIcon>
                  <PanoramaIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Screenshot</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose(setEl4)}>
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
              </MenuItem>
            </Menu>
          </MenuItem>
        </MenuList>
      </Toolbar>
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
