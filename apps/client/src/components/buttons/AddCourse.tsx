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
export default function AddCourseButton({ section, course }: Props) {
  const { enqueueSnackbar } = useSnackbar()

  const handleClick = () => {
    addCourse(section, course, undefined, {
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
