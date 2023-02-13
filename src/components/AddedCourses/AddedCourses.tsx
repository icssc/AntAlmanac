import { Box, Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';
import Schedule from '$components/Schedule';

function inferredReducer<T>(array: T[], func: (acc: T[], curr: T) => T[]) {
  return array.reduce(func, []);
}

export default function AddedCourses() {
  const { schedules, scheduleIndex, } = useScheduleStore()
  const schedule = schedules[scheduleIndex]
  const currentCourses = schedule.courses
  const coursesWithSections = currentCourses.map((course) => {
    return {
      ...course,
      sections: [course.section],
    };
  });
  const courses = inferredReducer(coursesWithSections, (accumulated, current) => {
    const found = accumulated.find(
      (existing) => existing.courseNumber === current.courseNumber && existing.deptCode === current.deptCode
    );
    if (found) {
      found.sections.push(current.section);
      return accumulated;
    } else {
      return [...accumulated, current];
    }
  });
  const totalUnits = courses.reduce((accumulated, current) => {
    return accumulated + parseInt(current.section.units, 10);
  }, 0);
  return (
    <Box>
      <Typography variant="h5" padding={2}>
        {schedule.scheduleName} ({totalUnits} units)
      </Typography>
      {courses.map((course, index) => (
        <Schedule key={index} course={course} term={course.term} />
      ))}
    </Box>
  );
}
