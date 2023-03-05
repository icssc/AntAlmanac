import { IconButton, Tooltip } from '@mui/material'
import { Backspace as BackspaceIcon } from '@mui/icons-material'
import { clearCurrentSchedule } from '$stores/schedule/schedule'

/**
 * button that clears the current schedule
 */
export default function ClearCurrentSchedule() {
  const handleClick = () => {
    if (window.confirm('Are you sure you want to clear this schedule?')) {
      clearCurrentSchedule()
    }
  }

  return (
    <Tooltip title="Clear Schedule">
      <IconButton onClick={handleClick}>
        <BackspaceIcon />
      </IconButton>
    </Tooltip>
  )
}
