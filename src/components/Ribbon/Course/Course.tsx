import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import {
  Backspace as BackspaceIcon,
  ChevronRight as ChevronRightIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
import { clearCurrentSchedule } from '$stores/schedule/schedule'
import { copyCoursesToSchedule } from '$stores/schedule/course'

export default function CourseMenu() {
  const { enqueueSnackbar } = useSnackbar()
  const { schedules, scheduleIndex } = useScheduleStore()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const currentSchedule = schedules[scheduleIndex]

  function handleClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  function handleClose(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  function handleClearCourses() {
    if (window.confirm('Are you sure you want to clear this schedule?')) {
      clearCurrentSchedule()
      enqueueSnackbar(`Successfully cleared ${currentSchedule.scheduleName}`, {
        variant: 'success',
      })
    }
  }

  /**
   * returns function that will copy courses to the schedule at the specified index
   */
  function handleAdd(index: number) {
    return () => {
      if (window.confirm(`Copy current courses to ${schedules[index].scheduleName}?`)) {
        copyCoursesToSchedule(index)
        enqueueSnackbar(`Copied current courses to ${schedules[index].scheduleName}`, {
          variant: 'success',
        })
      }
    }
  }

  function handleAddAll() {
    if (window.confirm(`Copy current courses to all schedules?`)) {
      copyCoursesToSchedule(schedules.length)
      enqueueSnackbar('Copied current courses to all schedules', { variant: 'success' })
    }
  }

  return (
    <>
      <MenuItem onClick={handleClick} disableRipple dense>
        <ListItemText>Course</ListItemText>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} transitionDuration={0}>
          <MenuItem onClick={handleClearCourses} divider dense>
            <ListItemIcon>
              <BackspaceIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clear Courses</ListItemText>
          </MenuItem>

          <MenuItem dense disabled>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Courses to</ListItemText>
          </MenuItem>

          {schedules.map((schedule, index) => (
            <MenuItem key={index} onClick={handleAdd(index)} dense>
              <ListItemIcon>
                <ChevronRightIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{schedule.scheduleName}</ListItemText>
            </MenuItem>
          ))}

          <MenuItem onClick={handleAddAll} dense>
            <ListItemIcon>
              <ChevronRightIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>All schedules</ListItemText>
          </MenuItem>
        </Menu>
      </MenuItem>
    </>
  )
}
