import { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { copyCoursesToSchedule } from '$stores/schedule/course'

/**
 * button that opens a dropdown to add the provided course to a target schedule(s)
 */
export default function CopyCoursesDialog() {
  const schedules = useScheduleStore((store) => store.schedules)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  /**
   * returns function that will copy courses to the schedule at the specified index
   */
  const handleAdd = (index: number) => () => {
    copyCoursesToSchedule(index)
  }

  const handleAddAll = () => {
    copyCoursesToSchedule(schedules.length)
  }

  return (
    <>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose}>
        {schedules.map((schedule, index) => (
          <MenuItem key={schedule.scheduleName} onClick={handleAdd(index)}>
            {schedule.scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleAddAll}>Add to all schedules</MenuItem>
      </Menu>
    </>
  )
}
