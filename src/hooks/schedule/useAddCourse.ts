import { useSnackbar } from 'notistack';
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
import { AppStoreCourse } from '../../types';
import { Section } from '$lib/peterportal.types';
import { courseNumAsDecimal, termsInSchedule } from '$lib/helpers';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';

interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

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
] as const;

const defaultColor = '#5ec8e0';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to add a course
 */
export default function useAddCourse() {
  // get values from the current state of the store
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addCourse = useScheduleStore((state) => state.addCourse);
  const addSection = useScheduleStore((state) => state.addSection);
  const { enqueueSnackbar } = useSnackbar();

  return (
    section: Section,
    courseDetails: CourseDetails,
    term: string,
    scheduleIndex: number,
    color?: string,
    quiet?: boolean
  ) => {
    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsEnum.classSearch.actions.ADD_COURSE,
      label: courseDetails.deptCode,
      value: courseNumAsDecimal(courseDetails.courseNumber),
    });

    const terms = termsInSchedule(addedCourses, term, scheduleIndex);
    const usedColors = new Set(addedCourses.map((course) => course.color));

    let existingCourse: AppStoreCourse;

    for (const course of addedCourses) {
      if (course.section.sectionCode === section.sectionCode && term === course.term) {
        existingCourse = course;
        if (course.scheduleIndices.includes(scheduleIndex)) {
          return course.color;
        } else {
          break;
        }
      }
    }

    if (terms.size > 1 && !quiet) {
      const termList = [...terms].sort().join(', ');
      const message = `Course added from different term.\nSchedule now contains courses from ${termList}.`;
      enqueueSnackbar(message, { style: { whiteSpace: 'pre-line' }, variant: 'warning' });
    }

    if (existingCourse === undefined) {
      const newCourse = {
        color: color || arrayOfColors.find((color) => !usedColors.has(color)) || defaultColor,
        term: term,
        deptCode: courseDetails.deptCode,
        courseNumber: courseDetails.courseNumber,
        courseTitle: courseDetails.courseTitle,
        courseComment: courseDetails.courseComment,
        prerequisiteLink: courseDetails.prerequisiteLink,
        scheduleIndices: scheduleIndex === scheduleNames.length ? [...scheduleNames.keys()] : [scheduleIndex],
        section: { ...section, color: color },
      };
      addCourse(newCourse);
    } else {
      const newSection = {
        ...existingCourse,
        scheduleIndices:
          scheduleIndex === scheduleNames.length
            ? [...scheduleNames.keys()]
            : existingCourse.scheduleIndices.concat(scheduleIndex),
      };
      addSection(newSection);
    }
    return color;
  };
}
