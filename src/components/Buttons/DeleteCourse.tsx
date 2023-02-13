import { IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { AASection } from '$types/peterportal';
import { useSearchStore } from '$stores/search';
import { deleteCourse } from '$stores/schedule/course';

interface Props {
  section: AASection;
  term?: string;
}

export default function DeleteCourseButton(props: Props) {
  const term = props.term ?? useSearchStore((store) => store.form.term);

  function handleClick() {
    deleteCourse(props.section.sectionCode, term);
  }

  return (
    <IconButton onClick={handleClick}>
      <DeleteIcon />
    </IconButton>
  );
}
