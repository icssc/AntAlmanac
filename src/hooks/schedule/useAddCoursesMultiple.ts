import { Section } from '$lib/peterportal.types';
import { AppStoreCourse } from '../../types';
import useAddCourse from './useAddCourse';
import { termsInSchedule } from '$lib/helpers';
import { useSnackbar } from 'notistack';

export interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

interface CourseInfo {
  courseDetails: CourseDetails;
  section: Section;
}

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to add multiple courses
 * @remarks uses the single useAddCourse hook
 */
export function useAddCoursesMultiple() {
  // use the single add course hook
  const addCourse = useAddCourse();

  // use the snackbar hook
  const { enqueueSnackbar } = useSnackbar();

  return (courseInfo: { [sectionCode: string]: CourseInfo }, term: string, scheduleIndex: number) => {
    let sectionsAdded = 0;
    const courses: AppStoreCourse[] = [];

    for (const section of Object.values(courseInfo)) {
      courses.push(addCourse(section.section, section.courseDetails, term, scheduleIndex, undefined, true));
      ++sectionsAdded;
    }

    const terms = termsInSchedule(courses, term, scheduleIndex);

    if (terms.size > 1) {
      const termList = [...terms].sort().join(', ');
      const message = `Course added from different term.\nSchedule now contains courses from ${termList}.`;
      enqueueSnackbar(message, { style: { whiteSpace: 'pre-line' }, variant: 'warning' });
    }
    return sectionsAdded;
  };
}
