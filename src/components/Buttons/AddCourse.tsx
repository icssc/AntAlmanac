import { useSnackbar } from 'notistack'
import { IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { AASection, AACourse } from '$lib/peterportal.types'
import { addCourse } from '$stores/schedule/course'
import { useScheduleStore } from '$stores/schedule'

interface Props {
  section: AASection
  course: AACourse
}

/**
 * button that adds the provided course to the schedule
 */
export default function AddCourseButton(props: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const { schedules } = useScheduleStore()

  function handleClick() {
    addCourse(props.section, props.course, undefined, {
      onSuccess(course, index) {
        enqueueSnackbar(`Added ${course?.courseTitle} to schedule ${schedules[index].scheduleName}`, {
          variant: 'success',
        })
      },
    })
  }

  return (
    <IconButton onClick={handleClick}>
      <AddIcon />
    </IconButton>
  )
}
