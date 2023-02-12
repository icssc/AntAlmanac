import { IconButton, } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { AASection, AACourse } from '$types/peterportal';
import { addCourse } from '$stores/schedule/course'

export interface CourseDetails {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
}

interface Props {
  section: AASection,
  course: CourseDetails
}

export default function AddCourseButton({ section, course }: Props) {
  function handleClick() {
    addCourse(section, course)
  }

  return (
      <IconButton onClick={handleClick}>
        <AddIcon />
      </IconButton>
  );
}

