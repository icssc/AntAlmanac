import { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { addCourse, addCourseToAllSchedules } from '$stores/schedule/course'
import type { AASection, AACourse } from '$lib/peterportal.types'

interface Props {
  section: AASection
  course: AACourse
}

/**
 * opens a dropdown menu to add a course to specified schedule(s)
 */
export default function AddCourseMenuButton(props: Props) {
  const { schedules } = useScheduleStore()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  /**
   * returns function to add a course to the schedule at the specified index
   */
  function handleAdd(index: number) {
    return () => {
      addCourse(props.section, props.course, index)
    }
  }

  function handleAddAll() {
    addCourseToAllSchedules(props.section, props.course)
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
