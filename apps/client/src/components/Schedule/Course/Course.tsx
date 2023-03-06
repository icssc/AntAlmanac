import { Box } from '@mui/material'
import type { WebsocCourse } from 'peterportal-api-next-types'
import CourseHead from './CourseHead'
import CourseBody from './CourseBody'

interface Props {
  course: WebsocCourse
  term?: string

  /**
   * whether course body needs to manually search for more info
   */
  supplemental?: boolean
}

/**
 * renders an AACourse for list of course search results
 */
export default function Course({ course, term, supplemental }: Props) {
  return (
    <Box>
      <CourseHead course={course} />
      <CourseBody course={course} term={term} supplemental={supplemental} />
    </Box>
  )
}
