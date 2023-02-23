import { useSnackbar } from 'notistack'
import { IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { AASection, AACourse } from '$lib/peterportal.types'
import { addCourse } from '$stores/schedule/course'

interface Props {
  section: AASection
  course: AACourse
}

/**
 * button that adds the provided course to the schedule
 */
export default function AddCourseButton(props: Props) {
  const { enqueueSnackbar } = useSnackbar()

  function handleClick() {
    addCourse(props.section, props.course, undefined, {
      onWarn(message) {
        enqueueSnackbar(message, { variant: 'warning' })
      },
    })
  }

  return (
    <IconButton onClick={handleClick}>
      <AddIcon />
    </IconButton>
  )
}
