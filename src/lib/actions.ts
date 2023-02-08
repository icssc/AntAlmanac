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
import { ShortCourseInfo, AppStoreCourse, UserData } from '../types';
import { Section } from '$lib/peterportal.types';
import { courseNumAsDecimal, termsInSchedule, getCoursesData } from '$lib/helpers';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';
import { SAVE_DATA_ENDPOINT, LOAD_DATA_ENDPOINT } from '$lib/endpoints';

export interface CourseDetails {
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
];

const defaultColor = '#5ec8e0';

export function useAddCourse(
  section: Section,
  courseDetails: CourseDetails,
  term: string,
  scheduleIndex: number,
  color?: string,
  quiet?: boolean
) {
  logAnalytics({
    category: analyticsEnum.classSearch.title,
    action: analyticsEnum.classSearch.actions.ADD_COURSE,
    label: courseDetails.deptCode,
    value: courseNumAsDecimal(courseDetails.courseNumber),
  });

  // get values from the current state of the store
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addCourse = useScheduleStore((state) => state.addCourse);
  const addSection = useScheduleStore((state) => state.addSection);

  // prepare the custom snackbar hook
  const warnMultipleTerms = useWarnMultipleTerms();

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
    warnMultipleTerms(terms);
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
}

export async function useSaveSchedule(userID: string, rememberMe: boolean) {
  // get the current state from the store
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const saveSchedule = useScheduleStore((state) => state.saveSchedule);

  // prepare the snackbar hook
  const { enqueueSnackbar } = useSnackbar();

  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  });

  if (userID == null) {
    return;
  }

  userID = userID.replace(/\s+/g, '');

  if (userID.length > 0) {
    if (rememberMe) {
      window.localStorage.setItem('userID', userID);
    } else {
      window.localStorage.removeItem('userID');
    }
    const userData = {
      addedCourses: [] as ShortCourseInfo[],
      scheduleNames: scheduleNames,
      customEvents: customEvents,
    };

    userData.addedCourses = addedCourses.map((course) => {
      return {
        color: course.color,
        term: course.term,
        sectionCode: course.section.sectionCode,
        scheduleIndices: course.scheduleIndices,
      };
    });

    try {
      await fetch(SAVE_DATA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, userData }),
      });

      enqueueSnackbar(`Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`, {
        variant: 'success',
      });

      saveSchedule();
    } catch (e) {
      enqueueSnackbar(`Schedule could not be saved under username "${userID}`, {
        variant: 'error',
      });
    }
  }
}

export async function useLoadSchedule(userID: string, rememberMe: boolean) {
  // get current state of store
  const loadSchedule = useScheduleStore((state) => state.loadSchedule);
  const unsavedChanges = useScheduleStore((state) => state.unsavedChanges);

  // prepare the snackbar hook
  const { enqueueSnackbar } = useSnackbar();

  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  });

  /**
   * if no user ID or the user has unsaved changes and cancels the confirmation dialog
   */
  if (
    userID == null ||
    (unsavedChanges && !window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
  ) {
    return;
  }

  userID = userID.replace(/\s+/g, '');

  if (userID.length === 0) {
    return;
  }

  if (rememberMe) {
    window.localStorage.setItem('userID', userID);
  } else {
    window.localStorage.removeItem('userID');
  }

  try {
    const response_data = await fetch(LOAD_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userID }),
    });
    if (response_data.status === 404) {
      enqueueSnackbar(`Couldn't find schedules for username "${userID}".`, {
        variant: 'error',
      });
      return;
    }
    const json = (await response_data.json()) as { userData: UserData };
    const courseData = await getCoursesData(json.userData);
    loadSchedule(courseData);
    enqueueSnackbar(`Schedule loaded for username "${userID}".`, {
      variant: 'success',
    });
  } catch (e) {
    console.error(e);
    enqueueSnackbar(`Unknown error occurred while loading schedule for username "${userID}".`, {
      variant: 'error',
    });
  }
}

/**
 * wrapper hook around enqueueSnackbar from notistack to warn about multiple terms
 * @returns a function that will enqueue the snackbar
 */
export function useWarnMultipleTerms() {
  const { enqueueSnackbar } = useSnackbar();
  return (terms: Set<string>) => {
    const termList = [...terms].sort().join(', ');
    const message = `Course added from different term.\nSchedule now contains courses from ${termList}.`;
    enqueueSnackbar(message, { style: { whiteSpace: 'pre-line' }, variant: 'warning' });
  };
}
