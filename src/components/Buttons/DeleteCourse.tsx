import { IconButton } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useSearchStore } from '$stores/search'
import { deleteCourse } from '$stores/schedule/course'
import type { AASection } from '$lib/peterportal.types'

interface Props {
  section: AASection
  term?: string
}

/**
 * deletes course
 */
export default function DeleteCourseButton(props: Props) {
  const { form } = useSearchStore()
  const term = props.term ?? form.term

  function handleClick() {
    deleteCourse(props.section.sectionCode, term)
  }

  return (
    <IconButton onClick={handleClick}>
      <DeleteIcon />
    </IconButton>
  )
}
