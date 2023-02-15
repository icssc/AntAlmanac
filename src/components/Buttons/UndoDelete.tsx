import { IconButton } from '@mui/material'
import { Undo as UndoIcon } from '@mui/icons-material'
import { undoDelete } from '$stores/schedule/course'

export default function UndoDeleteButton() {
  function handleClick() {
    undoDelete()
  }

  return (
    <IconButton onClick={handleClick} size="small">
      <UndoIcon />
    </IconButton>
  )
}
