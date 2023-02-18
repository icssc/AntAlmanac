import { IconButton } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { clearCurrentSchedule } from '$stores/schedule/schedule'

/**
 * clears current schedule
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
