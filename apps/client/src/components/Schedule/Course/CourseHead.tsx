import { Box } from '@mui/material'
import {
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material'
import { analyticsEnum } from '$lib/analytics'
import CourseSummaryButton from '$components/buttons/CourseSummary'
import CourseReferenceButton from '$components/buttons/CourseReference'
import type { AACourse } from '$lib/peterportal.types'
import GradesPopup from './GradesPopup'

interface Props {
  course: AACourse
  // term?: string
}

/**
 * the header for the course has buttons with popups, summaries, links to other helpful websites, etc.
 */
export default function CourseHead({ course }: Props) {
  const courseId = course.deptCode.replaceAll(' ', '') + course.courseNumber
  const encodedDept = encodeURIComponent(course.deptCode)

  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', marginY: 2 }}>
      <CourseSummaryButton course={course} />
      {course.prerequisiteLink && (
        <CourseReferenceButton
          analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
          title="Prerequisites"
          icon={<AssignmentIcon />}
          href={course.prerequisiteLink}
        />
      )}
      <CourseReferenceButton
        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
        title="Reviews"
        icon={<RateReviewIcon />}
        href={`https://peterportal.org/course/${courseId}`}
      />
      <CourseReferenceButton
        analyticsAction={analyticsEnum.classSearch.actions.CLICK_ZOTISTICS}
        title="Zotistics"
        icon={<AssessmentIcon />}
      >
        <GradesPopup course={course} />
      </CourseReferenceButton>
      <CourseReferenceButton
        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_ENROLLMENT}
        title="Past Enrollment"
        icon={<ShowChartIcon />}
        href={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${course.courseNumber}&courseType=all`}
      />
    </Box>
  )
}
