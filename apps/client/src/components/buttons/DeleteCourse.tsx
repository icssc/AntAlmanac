import { IconButton, Tooltip } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import type { WebsocSection } from 'peterportal-api-next-types'
import { useSearchStore } from '$stores/search'
import { deleteCourse } from '$stores/schedule/course'

interface Props {
  section: WebsocSection
  term?: string
}

/**
 * button that deletes the provided course
 */
export default function DeleteCourseButton({ section, term }: Props) {
  const storeTerm = useSearchStore((store) => store.form.term)

  const handleClick = () => {
    deleteCourse(section.sectionCode, term || storeTerm)
  }

  return (
    <Tooltip title="Delete Course">
      <IconButton onClick={handleClick}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  )
}
