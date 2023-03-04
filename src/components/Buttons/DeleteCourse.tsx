import { IconButton, Tooltip } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useSearchStore } from '$stores/search'
import { deleteCourse } from '$stores/schedule/course'
import type { AASection } from '$lib/peterportal.types'

interface Props {
  section: AASection
  term?: string
}

/**
 * button that deletes the provided course
 */
export default function DeleteCourseButton(props: Props) {
  const storeTerm = useSearchStore((store) => store.form.term)
  const term = props.term ?? storeTerm

  function handleClick() {
    deleteCourse(props.section.sectionCode, term)
  }

  return (
    <Tooltip title="Delete Course">
      <IconButton onClick={handleClick}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  )
}
