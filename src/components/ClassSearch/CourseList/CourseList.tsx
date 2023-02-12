import { Box, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSearchStore } from '$stores/search';
import type { WebsocResponse, School, Department, AACourse, AASection } from '$types/peterportal';
import useWebsocQuery from '$hooks/useQueryWebsoc';
import { useScheduleStore } from '$stores/schedule';
import SchoolCard from './SchoolCard';
import DeptCard from './DeptCard';
import SectionTable from './SectionTable';

type AnyThing = School | Department | AACourse;

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
  }, [] as AnyThing[]);
  return reduced;
}

export default function CourseList() {
  const { getParams, showResults, setShowResults, form } = useSearchStore();

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
      <IconButton onClick={handleBack}>
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={handleRefresh}>
        <RefreshIcon />
      </IconButton>
      {transformedData.map((data, index) => (
        <DoSomething key={index} info={data} />
      ))}
    </Box>
  );
}

function DoSomething(props: { info: AnyThing }) {
  const { info } = props;
  /**
   * info is a School
   */
  if ('departments' in info) {
    return <SchoolCard name={info.schoolName} comment={info.schoolComment} />;
  }

  /**
   * info is a Department
   */
  if ('courses' in info) {
    return <DeptCard name={`Department of ${info.deptName}`} comment={info.deptComment} />;
  }

  /**
   * info is AACourse
   */
  if ('courseNumber' in info) {
    return <SectionTable course={info} />;
  }

  return <Box>Error!</Box>;
}
