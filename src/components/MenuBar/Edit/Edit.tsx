import { useState } from 'react'
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { Redo as RedoIcon, Undo as UndoIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { undo, redo } from '$stores/schedule/commands'

export default function EditMenu() {
  const previousStates = useScheduleStore((state) => state.previousStates)
  const nextStates = useScheduleStore((state) => state.nextStates)

  const [el2, setEl2] = useState<HTMLElement>()

  function handleClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setEl2(e.currentTarget)
  }

  function handleClose(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setEl2(undefined)
  }

  function handleUndo(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    undo()
  }

  function handleRedo(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    redo()
  }

  return (
    <MenuItem onClick={handleClick} disableRipple>
      <ListItemText>Edit</ListItemText>
      <Menu anchorEl={el2} open={!!el2} onClose={handleClose} transitionDuration={0}>
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
