import type { AACourse } from '$types/peterportal';
import { Box } from '@mui/material';
import SectionHead from './SectionHead';
import SectionBody from './SectionBody';

interface Props {
  course: AACourse;
  term?: string;
}

/**
 * renders an AACourse for list of course search results
 */
export default function Section({ course, term }: Props) {
  return (
    <Box>
      <SectionHead course={course} term={term} />
      <SectionBody course={course} term={term} />
    </Box>
  );
}
