import { IconButton } from '@mui/material'
import { Undo as UndoIcon } from '@mui/icons-material'
import { undo } from '$stores/schedule/course'

/**
 * restores the most recent save state
 */
export default function UndoButton() {
  function handleClick() {
    undo()
  }

  return (
    <IconButton onClick={handleClick} size="small">
      <UndoIcon />
    </IconButton>
  )
}
