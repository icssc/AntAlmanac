import { useState } from 'react'
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { Redo as RedoIcon, Undo as UndoIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { undo, redo } from '$stores/schedule/commands'

export default function EditMenu() {
  const previousStates = useScheduleStore((state) => state.previousStates)
  const nextStates = useScheduleStore((state) => state.nextStates)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleClose = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  const handleUndo = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    undo()
  }

  const handleRedo = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    redo()
  }

  return (
    <MenuItem onClick={handleClick} disableRipple>
      <ListItemText>Edit</ListItemText>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} transitionDuration={0}>
        <MenuItem onClick={handleUndo} sx={{ width: 200 }} disabled={!previousStates.length} dense>
          <ListItemIcon>
            <UndoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Undo</ListItemText>
          <Typography variant="body2">⌘+Z</Typography>
        </MenuItem>
        <MenuItem onClick={handleRedo} disabled={!nextStates.length} dense>
          <ListItemIcon>
            <RedoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Redo</ListItemText>
          <Typography variant="body2">⌘+Shift+Z</Typography>
        </MenuItem>
      </Menu>
    </MenuItem>
  )
}
