import { Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSearchStore } from '$stores/search';
import { useSettingsStore } from '$stores/settings';
import { useScheduleStore } from '$stores/schedule';
import useWebsocQuery from '$hooks/useWebsocQuery';
import Schedule from '$components/Schedule';
import type { WebsocResponse, School, Department, AACourse, AASection } from '$types/peterportal';

/**
 * flattens the websoc response
 */
function flattenSOCObject(SOCObject: WebsocResponse) {
  const { schedules, scheduleIndex } = useScheduleStore.getState();

  const courses = schedules[scheduleIndex]?.courses || [];

  const courseColors = courses.reduce((accumulator, { section }) => {
    accumulator[section.sectionCode] = section.color;
    return accumulator;
  }, {} as { [key: string]: string });

  const reduced = SOCObject.schools.reduce((accumulator, school) => {
    accumulator.push(school);
    school.departments.forEach((dept) => {
      accumulator.push(dept);
      dept.courses.forEach((course) => {
        for (const section of course.sections) {
          (section as AASection).color = courseColors[section.sectionCode];
        }
        accumulator.push(course as AACourse);
      });
    });
    return accumulator;
  }, [] as (School | Department | AACourse)[]);

  return reduced;
}

/**
 * renders the list of course search results
 */
export default function CourseList() {
  const { getParams, showResults, setShowResults } = useSearchStore();
  const isDarkMode = useSettingsStore((store) => store.isDarkMode);

  const darkMode = isDarkMode();

  /**
   * when the store's value changes, getParams triggers a new query
   */
  const query = useWebsocQuery(getParams(), {
    enabled: showResults,
  });

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
