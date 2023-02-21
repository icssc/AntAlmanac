import { useState } from 'react'
import { Add as AddIcon } from '@mui/icons-material'
import { ListItemIcon, ListItemText, MenuItem, Select } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useScheduleStore } from '$stores/schedule'
import { setScheduleIndex } from '$stores/schedule/schedule'
import RenameScheduleDialog from '$components/Dialog/RenameSchedule'

/**
 * select form that can switch between schedules or add a new schedule
 */
export default function SelectScheduleButton() {
  const { schedules, scheduleIndex } = useScheduleStore()
  const [open, setOpen] = useState(false)

  function handleOpen() {
    setOpen(true)
  }

  function handleSelectChange(e: SelectChangeEvent<string>) {
    const index = parseInt(e.target.value, 10)
    if (index < schedules.length) {
      setScheduleIndex(index)
    }
  }

  return (
    <>
      <Select size="small" value={scheduleIndex.toString()} onChange={handleSelectChange} fullWidth>
        {schedules.map((schedule, index) => (
          <MenuItem key={index} value={index}>
            {schedule.scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleOpen} value={schedules.length}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>Add Schedule</ListItemText>
        </MenuItem>
      </Select>

      <RenameScheduleDialog open={open} setOpen={setOpen} index={schedules.length} />
    </>
  )
}
