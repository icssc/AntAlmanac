import { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material'
import type { AASection, AACourse } from '$types/peterportal'
import { useScheduleStore } from '$stores/schedule'
import { addCourse, addCourseToAllSchedules } from '$stores/schedule/course'

interface Props {
  section: AASection
  course: AACourse
}

/**
 * button that opens a dropdown to add the provided course to a target schedule(s)
 */
export default function AddCourseMenuButton(props: Props) {
  const schedules = useScheduleStore((store) => store.schedules)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  /**
   * returns function that will add a course to the schedule at the specified index
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
