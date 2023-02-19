import { useState } from 'react'
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { ChevronRight as ChevronRightIcon, ClearAll as ClearAllIcon, FileCopy as FileCopyIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { clearCurrentSchedule } from '$stores/schedule/schedule'
import { copyCoursesToSchedule } from '$stores/schedule/course'

export default function CourseMenu() {
  const { schedules } = useScheduleStore()

  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const [copyEl, setCopyEl] = useState<HTMLElement>()

  function handleClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  function handleClose(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  function handleCopyClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setCopyEl(e.currentTarget)
  }

  function handleCopyClose(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setCopyEl(undefined)
  }

  function handleClearCourses() {
    clearCurrentSchedule()
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
      <MenuItem onClick={handleClick} disableRipple>
        <ListItemText>Course</ListItemText>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} transitionDuration={0}>
          <MenuItem onClick={handleClearCourses}>
            <ListItemIcon>
              <ClearAllIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clear Courses</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyClick}>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Courses to</ListItemText>
            <ListItemIcon>
              <ChevronRightIcon fontSize="small" />
            </ListItemIcon>
          </MenuItem>
        </Menu>
      </MenuItem>
      <Menu
        open={!!copyEl}
        anchorEl={copyEl}
        onClose={handleCopyClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
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
