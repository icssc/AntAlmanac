import { useRef } from 'react';
import { Box } from '@mui/material';
import Toolbar from './Toolbar';

export default function Calendar() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box>
      <Toolbar imgRef={ref} />
      <Box ref={ref}>HEHE</Box>
    </Box>
  );
}
