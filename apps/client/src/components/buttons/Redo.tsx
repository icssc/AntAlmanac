import { IconButton, Tooltip } from '@mui/material'
import { Redo as RedoIcon } from '@mui/icons-material'
import { redo } from '$stores/schedule/commands'

export default function RedoButton() {
  const handleClick = () => {
    redo()
  }

  return (
    <Tooltip title="Redo (Ctrl+Shift+Z)">
      <IconButton onClick={handleClick}>
        <RedoIcon />
      </IconButton>
    </Tooltip>
  )
}
