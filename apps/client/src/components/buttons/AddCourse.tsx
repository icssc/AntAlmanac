import { useSnackbar } from 'notistack'
import { IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { WebsocCourse, WebsocSection } from 'peterportal-api-next-types'
import { addCourse } from '$stores/schedule/course'

interface Props {
  section: WebsocSection
  course: WebsocCourse
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
