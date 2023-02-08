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
import { AppStoreCourse, RepeatingCustomEvent, ShortCourseInfo, UserData } from '../types';
import { Section } from '$lib/peterportal.types';
import { courseNumAsDecimal, termsInSchedule, getCoursesData } from '$lib/helpers';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';
import { SAVE_DATA_ENDPOINT, LOAD_DATA_ENDPOINT } from '$lib/endpoints';

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
];

const defaultColor = '#5ec8e0';

export function useAddCourse() {
  // get values from the current state of the store
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addCourse = useScheduleStore((state) => state.addCourse);
  const addSection = useScheduleStore((state) => state.addSection);

  // prepare the custom snackbar hook
  const warnMultipleTerms = useWarnMultipleTerms();

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
  };
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

export function useDeleteCourse(sectionCode: string, scheduleIndex: number, term: string) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  let deletedCourses = useScheduleStore((state) => state.deletedCourses);
  const deleteCourse = useScheduleStore((state) => state.deleteCourse);

  const addedCoursesAfterDelete = addedCourses.filter((course) => {
    if (course.section.sectionCode === sectionCode && course.term === term) {
      deletedCourses = deletedCourses.concat({
        ...course,
        scheduleIndex,
      });
      if (course.scheduleIndices.length === 1) {
        return false;
      } else {
        course.scheduleIndices = course.scheduleIndices.filter((index) => index !== scheduleIndex);

        return true;
      }
    }
    return true;
  });

  deleteCourse(addedCoursesAfterDelete, deletedCourses);
}

export function useDeleteCustomEvent(customEventID: number, scheduleIndex: number) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const deleteCustomEvent = useScheduleStore((state) => state.deleteCustomEvent);

  const customEventsAfterDelete = customEvents.filter((customEvent) => {
    if (customEvent.customEventID === customEventID) {
      if (customEvent.scheduleIndices.length === 1) {
        return false;
      } else {
        customEvent.scheduleIndices = customEvent.scheduleIndices.filter((index) => index !== scheduleIndex);

        return true;
      }
    }
    return true;
  });

  deleteCustomEvent(customEventsAfterDelete);
}

export function useEditCustomEvent(newCustomEvent: RepeatingCustomEvent) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const editCustomEvent = useScheduleStore((state) => state.editCustomEvent);
  const customEventsAfterEdit = customEvents.map((customEvent) => {
    if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
    else return newCustomEvent;
  });
  editCustomEvent(customEventsAfterEdit);
}

export function useClearSchedules(scheduleIndicesToClear: number[]) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const clearSchedule = useScheduleStore((state) => state.clearSchedule);

  const addedCoursesAfterClear = addedCourses.filter((course) => {
    course.scheduleIndices = course.scheduleIndices.filter((index) => !scheduleIndicesToClear.includes(index));
    return course.scheduleIndices.length !== 0;
  });

  const customEventsAfterClear = customEvents.filter((customEvent) => {
    customEvent.scheduleIndices = customEvent.scheduleIndices.filter(
      (index) => !scheduleIndicesToClear.includes(index)
    );
    return customEvent.scheduleIndices.length !== 0;
  });

  clearSchedule(addedCoursesAfterClear, customEventsAfterClear);
}

export function useAddCustomEvent(customEvent: RepeatingCustomEvent) {
  const addCustomEvent = useScheduleStore((state) => state.addCustomEvent);
  addCustomEvent(customEvent);
}

export function useUndoDelete(event: KeyboardEvent | null) {
  const deletedCourses = useScheduleStore((state) => state.deletedCourses);
  const undoDelete = useScheduleStore((state) => state.undoDelete);
  const addCourse = useAddCourse();
  const { enqueueSnackbar } = useSnackbar();

  if (deletedCourses.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
    const lastDeleted = deletedCourses[deletedCourses.length - 1];

    if (lastDeleted == null) {
      return;
    }

    addCourse(lastDeleted.section, lastDeleted, lastDeleted.term, lastDeleted.scheduleIndex, lastDeleted.color);
    undoDelete(deletedCourses.slice(0, deletedCourses.length - 1));

    enqueueSnackbar(
      `Undo delete ${lastDeleted.deptCode} ${lastDeleted.courseNumber} in schedule ${lastDeleted.scheduleIndex + 1}.`,
      {
        variant: 'success',
      }
    );
  }
}

export function useChangeCustomEventColor(customEventID: number, newColor: string) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const changeCustomEventColor = useScheduleStore((state) => state.changeCustomEventColor);

  const customEventsAfterColorChange = customEvents.map((customEvent) => {
    if (customEvent.customEventID === customEventID) {
      return { ...customEvent, color: newColor };
    } else {
      return customEvent;
    }
  });

  changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor);
}

export function useChangeCourseColor(sectionCode: string, newColor: string, term: string) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const changeCourseColor = useScheduleStore((state) => state.changeCourseColor);

  const addedCoursesAfterColorChange = addedCourses.map((addedCourse) => {
    if (addedCourse.section.sectionCode === sectionCode && addedCourse.term === term) {
      return { ...addedCourse, color: newColor };
    } else {
      return addedCourse;
    }
  });

  changeCourseColor(addedCoursesAfterColorChange, sectionCode, newColor);
}

export function useCopySchedule(from: number, to: number) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const copySchedule = useScheduleStore((state) => state.copySchedule);

  const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
    if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
      // If to is equal to the length of scheduleNames, then the user wanted to copy to
      // all schedules; otherwise, if to is less than the length of scheduleNames, then
      // only one schedule should be altered
      if (to === scheduleNames.length) return { ...addedCourse, scheduleIndices: [...scheduleNames.keys()] };
      // this [...array.keys()] idiom is like list(range(len(array))) in python
      else
        return {
          ...addedCourse,
          scheduleIndices: addedCourse.scheduleIndices.concat(to),
        };
    } else {
      return addedCourse;
    }
  });

  const customEventsAfterCopy = customEvents.map((customEvent) => {
    if (customEvent.scheduleIndices.includes(from) && !customEvent.scheduleIndices.includes(to)) {
      if (to === scheduleNames.length) return { ...customEvent, scheduleIndices: [...scheduleNames.keys()] };
      else
        return {
          ...customEvent,
          scheduleIndices: customEvent.scheduleIndices.concat(to),
        };
    } else {
      return customEvent;
    }
  });

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
  });

  copySchedule(addedCoursesAfterCopy, customEventsAfterCopy);
}

export function useAddSchedule(scheduleName: string) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addSchedule = useScheduleStore((state) => state.addSchedule);

  const newScheduleNames = [...scheduleNames, scheduleName];
  addSchedule(newScheduleNames);
}

export function useRenameSchedule(scheduleName: string, scheduleIndex: number) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const renameSchedule = useScheduleStore((state) => state.renameSchedule);
  const newScheduleNames = [...scheduleNames];
  newScheduleNames[scheduleIndex] = scheduleName;
  renameSchedule(newScheduleNames);
}

/**
 * either types of event for the generic function param below
 */
type AnyEvent = AppStoreCourse | RepeatingCustomEvent;

/**
 * After a schedule is deleted, we need to update every course and
 * custom event in every schedule. In this case, we want to update the
 * scheduleIndices array so that each event appears in the correct schedule
 *
 * @remarks
 * T is a generic function param
 * it will be inferred by whatever type you pass to the "events" param
 * the return type is inferred as T[]
 *
 * @example if you pass an array of AppStoreCourse, the return type will be inferred as AppStoreCourse[]
 */
function getEventsAfterDeleteSchedule<T extends AnyEvent>(events: T[], currentScheduleIndex: number) {
  const newEvents = [] as typeof events;

  events.forEach((event) => {
    const newScheduleIndices = [] as number[];

    event.scheduleIndices.forEach((index) => {
      if (index !== currentScheduleIndex) {
        // If a schedule gets deleted, all schedules after it are shifted back,
        // which means we sometimes need to subtract an index by 1
        newScheduleIndices.push(index > currentScheduleIndex ? index - 1 : index);
      }
    });

    if (newScheduleIndices.length > 0) {
      event.scheduleIndices = newScheduleIndices;
      newEvents.push(event);
    }
  });
  return newEvents;
}

export function useDeleteSchedule(scheduleIndex: number) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const currentScheduleIndex = useScheduleStore((state) => state.currentScheduleIndex);
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const deleteSchedule = useScheduleStore((state) => state.deleteSchedule);

  const newScheduleNames = [...scheduleNames];
  newScheduleNames.splice(scheduleIndex, 1);

  let newScheduleIndex = currentScheduleIndex;
  if (newScheduleIndex === newScheduleNames.length) {
    newScheduleIndex--;
  }

  const newAddedCourses = getEventsAfterDeleteSchedule(addedCourses, currentScheduleIndex);
  const newCustomEvents = getEventsAfterDeleteSchedule(customEvents, currentScheduleIndex);

  deleteSchedule(newScheduleNames, newAddedCourses, newCustomEvents, newScheduleIndex);
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
