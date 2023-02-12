import { Typography } from '@mui/material';
import type { School, Department, AACourse } from '$types/peterportal';
import SchoolCard from './SchoolCard';
import DeptCard from './DeptCard';
import Section from './Section';

interface Props {
  course: School | Department | AACourse;
}

/**
 * renders a row in the list of course search results;
 */
export default function CourseRow({ course }: Props) {
  /**
   * course is a School
   */
  if ('departments' in course) {
    return <SchoolCard school={course} />;
  }

  /**
   * course is a Department
   */
  if ('deptName' in course) {
    return <DeptCard department={course} />;
  }

  /**
   * course is AACourse,
   * TODO: maybe name the component something besides "Section" ?
   */
  if ('courseNumber' in course) {
    return <Section course={course} />;
  }

  /**
   * shouldn't ever get here
   */
  return <Typography color="error">Error!</Typography>;
}
