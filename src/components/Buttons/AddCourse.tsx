import { IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { addCourse } from '$stores/schedule/course'
import type { AASection, AACourse } from '$lib/peterportal.types'

interface Props {
  section: AASection
  course: AACourse
}

/**
 * adds a course to current schedule
 */
export default function AddCourseButton(props: Props) {
  function handleClick() {
    addCourse(props.section, props.course)
  }

  return (
    <IconButton onClick={handleClick}>
      <AddIcon />
    </IconButton>
  )
}
