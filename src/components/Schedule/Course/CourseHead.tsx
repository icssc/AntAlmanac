import { Box } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import type { AACourse } from '$types/peterportal';
import { analyticsEnum } from '$lib/analytics';
import CourseSummaryButton from '$components/Buttons/CourseSummary';
import CourseReferenceButton from '$components/Buttons/CourseReference';
import GradesPopup from '$components/GradesPopup';

interface Props {
  course: AACourse;
  term?: string;
}

/**
 * the header for the course has buttons with popups, summaries, links to other helpful websites, etc.
 */
export default function CourseHead(props: Props) {
  const courseId = props.course.deptCode.replaceAll(' ', '') + props.course.courseNumber;
  const encodedDept = encodeURIComponent(props.course.deptCode);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', margin: 1 }}>
      <CourseSummaryButton {...props} />
      {props.course.prerequisiteLink && (
        <CourseReferenceButton
          analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
          title="Prerequisites"
          icon={<AssignmentIcon />}
          href={props.course.prerequisiteLink}
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
        <GradesPopup {...props} />
      </CourseReferenceButton>
      <CourseReferenceButton
        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_ENROLLMENT}
        title="Past Enrollment"
        icon={<ShowChartIcon />}
        href={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${props.course.courseNumber}&courseType=all`}
      />
    </Box>
  );
}
