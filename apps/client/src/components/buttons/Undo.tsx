import { IconButton, Tooltip } from '@mui/material'
import { Undo as UndoIcon } from '@mui/icons-material'
import { undo } from '$stores/schedule/commands'

export default function UndoButton() {
  const handleClick = () => {
    undo()
  }

  return (
    <Tooltip title="Undo (Ctrl+Z)">
      <IconButton onClick={handleClick}>
        <UndoIcon />
      </IconButton>
    </Tooltip>
  )
}
