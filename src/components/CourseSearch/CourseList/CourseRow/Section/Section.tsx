import type { AACourse } from '$types/peterportal';
import { Box } from '@mui/material';
import SectionHead from './SectionHead';
import SectionBody from './SectionBody';

interface Props {
  course: AACourse;
}

/**
 * renders an AACourse for list of course search results
 */
export default function Section({ course }: Props) {
  return (
    <Box>
      <SectionHead course={course} />
      <SectionBody course={course} />
    </Box>
  );
}
