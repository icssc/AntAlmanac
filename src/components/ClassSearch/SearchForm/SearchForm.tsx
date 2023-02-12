import { Box } from '@mui/material';
import TermSelector from './TermSelector';
import FuzzySearch from './FuzzySearch';

export default function SearchForm() {
  return (
    <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TermSelector />
      <FuzzySearch />
    </Box>
  );
}
