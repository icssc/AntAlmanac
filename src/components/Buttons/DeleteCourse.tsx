import { useSnackbar } from 'notistack'
import { IconButton } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useScheduleStore } from '$stores/schedule'
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
  const { schedules } = useScheduleStore()
  const { enqueueSnackbar } = useSnackbar()
  const storeTerm = useSearchStore((store) => store.form.term)
  const term = props.term ?? storeTerm

  function handleClick() {
    deleteCourse(props.section.sectionCode, term, {
      onSuccess(course, index) {
        enqueueSnackbar(`Deleted ${course?.courseTitle} from ${schedules[index].scheduleName}`, {
          variant: 'error',
        })
      },
    })
  }

  return (
    <IconButton onClick={handleClick}>
      <DeleteIcon />
    </IconButton>
  )
}
