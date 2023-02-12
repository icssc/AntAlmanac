import { Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSearchStore } from '$stores/search';
import useWebsocQuery from '$hooks/useQueryWebsoc';

export default function CourseList() {
  const { getParams, showResults, setShowResults } = useSearchStore();

  function handleRefresh() {
    query.refetch();
  }

  function handleBack() {
    setShowResults(false);
  }

  /**
   * when the store's value changes, getParams triggers a new query
   */
  const query = useWebsocQuery(getParams(), {
    enabled: showResults,
  });

  return (
    <Box>
      <Box>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
      {JSON.stringify(query.data)}
    </Box>
  );
}
