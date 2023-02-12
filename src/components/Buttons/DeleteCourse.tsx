import { IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { AASection } from '$types/peterportal';
import { useSearchStore } from '$stores/search';
import { deleteCourse } from '$stores/schedule/course';

export interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

interface Props {
  section: AASection;
}

export default function DeleteCourseButton({ section }: Props) {
  const term = useSearchStore((store) => store.form.term);

  function handleClick() {
    deleteCourse(section.sectionCode, term);
  }

  return (
    <IconButton onClick={handleClick}>
      <DeleteIcon />
    </IconButton>
  );
}
