import { Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSearchStore } from '$stores/search';
import useWebsocQuery from '$hooks/useQueryWebsoc';
import { useScheduleStore } from '$stores/schedule';
import type { WebsocResponse, School, Department, AACourse, AASection } from '$types/peterportal';
import CourseRow from './CourseRow';

/**
 * flattens the websoc response
 */
function flattenSOCObject(SOCObject: WebsocResponse) {
  const courseColors = useScheduleStore
    .getState()
    .currentCourses()
    .reduce((accumulator, { section }) => {
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

  const rawData = query.data;
  const transformedData = rawData ? flattenSOCObject(rawData) : [];

  return (
    <Box>
      <Box sx={{ padding: 1 }}>
        <IconButton onClick={handleBack} size="large">
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={handleRefresh} size="large">
          <RefreshIcon />
        </IconButton>
      </Box>
      <Box>
        {transformedData.map((data, index) => (
          <CourseRow key={index} course={data} />
        ))}
      </Box>
    </Box>
  );
}
