import { IconButton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { AASection, AACourse } from '$types/peterportal';
import { addCourse } from '$stores/schedule/course';

interface Props {
  section: AASection;
  course: AACourse;
}

/**
 * button that adds the provided course to the schedule
 */
export default function AddCourseButton(props: Props) {
  function handleClick() {
    addCourse(props.section, props.course);
  }

  return (
    <IconButton onClick={handleClick}>
      <AddIcon />
    </IconButton>
  );
}
