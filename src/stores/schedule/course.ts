/**
 * functions that manage courses in the schedule store
 */

import {
  amber,
  blue,
  blueGrey,
  cyan,
  deepPurple,
  green,
  indigo,
  lightGreen,
  lime,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors';
import { useScheduleStore, Course } from '.';

const arrayOfColors = [
  red[500],
  pink[500],
  purple[500],
  indigo[500],
  deepPurple[500],
  blue[500],
  green[500],
  cyan[500],
  teal[500],
  lightGreen[500],
  lime[500],
  amber[500],
  blueGrey[500],
];

/**
 * @return Reference of the course that matches the params.
 * @param sectionCode
 * @param term
 */
export function getExistingCourse(sectionCode: string, term: string) {
  const { schedules } = useScheduleStore.getState();
  const allCourses = schedules.map((schedule) => schedule.courses).flat(1);
  return allCourses.find((course) => course.section.sectionCode === sectionCode && course.term === term);
}

/**
 * Checks if a course has already been added to a schedule
 * @param sectionCode
 * @param term
 * @param scheduleIndex
 */
export function doesCourseExistInSchedule(sectionCode: string, term: string, scheduleIndex: number) {
  const { schedules } = useScheduleStore.getState();
  return schedules[scheduleIndex].courses.some(
    (course) => course.section.sectionCode === sectionCode && course.term === term
  );
}

/**
 * add a course to a schedule
 */
export function addCourse(
  newCourse: Course,
  scheduleIndex: number = useScheduleStore.getState().scheduleIndex,
  canUndo = true
) {
  const { addUndoState, schedules } = useScheduleStore.getState();
  if (canUndo) {
    addUndoState();
  }

  const allCourses = schedules.map((schedule) => schedule.courses).flat(1);

  /**
   * attempt to find the course to add
   */
  let courseToAdd = getExistingCourse(newCourse.section.sectionCode, newCourse.term);

  /**
   * create a new course if it didn't exist
   */
  if (courseToAdd === undefined) {
    const setOfUsedColors = new Set(allCourses.map((course) => course.section.color));
    const color = arrayOfColors.find((materialColor) => !setOfUsedColors.has(materialColor)) || '#5ec8e0';
    courseToAdd = {
      ...newCourse,
      section: {
        ...newCourse.section,
        color,
      },
    };
  }

  /**
   * add the course to the current schedule if not present and update the store
   */
  if (!doesCourseExistInSchedule(newCourse.section.sectionCode, newCourse.term, scheduleIndex)) {
    schedules[scheduleIndex].courses.push(courseToAdd);
    useScheduleStore.setState({ schedules });
  }
}

export function addCourseToAllSchedules(newCourse: Course) {
  const { addUndoState, schedules } = useScheduleStore.getState();
  addUndoState();
  for (let i = 0; i < schedules.length; ++i) {
    addCourse(newCourse, i, false);
  }
}

/**
 * change a course's color
 * @param sectionCode section code
 * @param term term
 * @param newColor color
 */
export function changeCourseColor(sectionCode: string, term: string, newColor: string) {
  const { addUndoState, schedules } = useScheduleStore.getState();
  addUndoState();
  const course = getExistingCourse(sectionCode, term);
  if (course) {
    course.section.color = newColor;
    useScheduleStore.setState({ schedules });
  }
}

/**
 * delete a course from schedule
 * @param sectionCode section code
 * @param term term
 */
export function deleteCourse(sectionCode: string, term: string) {
  const { addUndoState, schedules, scheduleIndex } = useScheduleStore.getState();
  addUndoState();
  schedules[scheduleIndex].courses = schedules[scheduleIndex].courses.filter(
    (course) => !(course.section.sectionCode === sectionCode && course.term === term)
  );
  useScheduleStore.setState({ schedules });
}
