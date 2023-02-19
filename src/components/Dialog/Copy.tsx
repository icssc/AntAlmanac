import { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { copyCoursesToSchedule } from '$stores/schedule/course'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * button that opens a dropdown to add the provided course to a target schedule(s)
 */
export default function CopyCoursesDialog(props: Props) {
  const { open, setOpen } = props
  const schedules = useScheduleStore((store) => store.schedules)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  /**
   * returns function that will copy courses to the schedule at the specified index
   */
  function handleAdd(index: number) {
    return () => {
      copyCoursesToSchedule(index)
    }
  }

  function handleAddAll() {
    copyCoursesToSchedule(schedules.length)
  }

  return (
    <>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose}>
        {schedules.map((schedule, index) => (
          <MenuItem key={index} onClick={handleAdd(index)}>
            {schedule.scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleAddAll}>Add to all schedules</MenuItem>
      </Menu>
    </>
  )
}
