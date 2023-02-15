import { IconButton } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { clearCurrentSchedule } from '$stores/schedule/schedule'

/**
 * button that clears the current schedule
 */
export default function ClearCurrentSchedule() {
  function handleClick() {
    clearCurrentSchedule()
  }

  return (
    <IconButton onClick={handleClick}>
      <DeleteIcon />
    </IconButton>
  )
}
