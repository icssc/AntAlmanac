import { Box } from '@mui/material'
import type { AACourse } from '$lib/peterportal.types'
import CourseHead from './CourseHead'
import CourseBody from './CourseBody'

interface Props {
  course: AACourse
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
      <CourseHead course={course} term={term} />
      <CourseBody course={course} term={term} supplemental={supplemental} />
    </Box>
  )
}
