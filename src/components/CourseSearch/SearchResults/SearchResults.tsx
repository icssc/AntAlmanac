import { Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { flattenSOCObject } from '$lib/websoc';
import { useSearchStore } from '$stores/search';
import { useSettingsStore } from '$stores/settings';
import useWebsocQuery from '$hooks/useWebsocQuery';
import Schedule from '$components/Schedule';

/**
 * renders the list of course search results
 */
export default function CourseList() {
  const { getParams, showResults, setShowResults } = useSearchStore();
  const isDarkMode = useSettingsStore((store) => store.isDarkMode);

  const darkMode = isDarkMode();

  /**
   * when the store's value changes, getParams triggers a new query
   * FIXME: this isn't fully reactive since it's a function, not a top level property;
   * reactivity is triggered when properties change; functions don't change so they don't trigger re-renders
   */
  const query = useWebsocQuery(getParams(), { enabled: showResults });

  const rawData = query.data;
  const transformedData = rawData ? flattenSOCObject(rawData) : [];

  const noResultsSrc = darkMode ? '/no_results/dark.png' : '/no_results/light.png';
  const loadingSrc = darkMode ? '/loading/dark.gif' : '/loading/light.gif';

  function handleRefresh() {
    query.refetch();
  }

  function handleBack() {
    setShowResults(false);
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ padding: 1 }}>
        <IconButton onClick={handleBack} size="large">
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={handleRefresh} size="large">
          <RefreshIcon />
        </IconButton>
      </Box>
      {!query.isFetched && (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={loadingSrc} alt="Loading!" />
        </Box>
      )}
      {query.isFetched &&
        (transformedData.length ? (
          <Box>
            {transformedData.map((data, index) => (
              <Schedule key={index} course={data} />
            ))}
          </Box>
        ) : (
          <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={noResultsSrc} alt="No results found :(" />
          </Box>
        ))}
    </Box>
  );
}
