import { Box } from '@mui/material'
import type { AACourse } from '$types/peterportal'
import CourseHead from './CourseHead'
import CourseBody from './CourseBody'

interface Props {
  course: AACourse
  term?: string
}

/**
 * renders an AACourse for list of course search results
 */
export default function Course({ course, term }: Props) {
  return (
    <Box>
      <CourseHead course={course} term={term} />
      <CourseBody course={course} term={term} />
    </Box>
  )
}
