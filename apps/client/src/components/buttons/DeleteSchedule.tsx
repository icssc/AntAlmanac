import { IconButton, Tooltip } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { deleteCurrentSchedule } from '$stores/schedule/schedule'

export default function DeleteScheduleButton() {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteCurrentSchedule()
    }
  }

  return (
    <Tooltip title="Delete Current Schedule">
      <IconButton onClick={handleDelete}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  )
}
