import { create } from 'zustand';
import { VariantType } from 'notistack';
import { CourseData } from '$lib/helpers';
import { AppStoreCourse, CalendarEvent, CourseEvent, RepeatingCustomEvent } from './types';
import { getSectionCodes, calendarizeFinals, calendarizeCourseEvents, calendarizeCustomEvents } from './helpers';

export interface SnackbarPosition {
  horizontal: 'left' | 'right';
  vertical: 'bottom' | 'top';
}

export interface ShortCourseInfo {
  color: string;
  term: string;
  sectionCode: string;
  scheduleIndices: number[];
}
export interface UserData {
  addedCourses: ShortCourseInfo[];
  scheduleNames: string[];
  customEvents: RepeatingCustomEvent[];
}

export interface AppStoreDeletedCourse extends AppStoreCourse {
  scheduleIndex: number;
}

export interface AppStore {
  currentScheduleIndex: number;
  customEvents: RepeatingCustomEvent[];
  addedCourses: AppStoreCourse[];
  addedSectionCodes: { [key: number]: Set<string> };
  colorPickers: { [key: string]: any };
  deletedCourses: AppStoreDeletedCourse[];
  snackbarMessage: string;
  snackbarVariant: VariantType;
  snackbarDuration: number;
  snackbarPosition: SnackbarPosition;
  snackbarStyle: object; // not sure what this is. I don't think we ever use it
  theme: string;
  eventsInCalendar: CalendarEvent[];
  finalsEventsInCalendar: CourseEvent[];
  scheduleNames: string[];
  unsavedChanges: boolean;
  color: any;
}

export function getTheme() {
  const theme = typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('theme');
  return theme === null ? 'auto' : theme;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentScheduleIndex: 0,
  customEvents: [],
  addedCourses: [],
  addedSectionCodes: { 0: new Set() },
  colorPickers: {},
  color: '',
  deletedCourses: [],
  snackbarMessage: '',
  snackbarVariant: 'info',
  snackbarDuration: 3000,
  snackbarPosition: { vertical: 'bottom', horizontal: 'left' },
  snackbarStyle: {},
  eventsInCalendar: [],
  finalsEventsInCalendar: [],
  unsavedChanges: false,
  scheduleNames: ['Schedule 1'],
  theme: getTheme(),

  addCourse(newCourse: AppStoreCourse) {
    const addedCourses = [...get().addedCourses, newCourse];
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(get().customEvents)];
    const unsavedChanges = true;

    set(() => ({
      addedCourses,
      eventsInCalendar,
      unsavedChanges,
      finalsEventsInCalendar,
    }));
  },

  /**
   */
  addSection(newSection: AppStoreCourse) {
    const addedCourses = get().addedCourses.map((course) =>
      course.section.sectionCode === newSection.section.sectionCode ? newSection : course
    );
    const addedSectionCodes = getSectionCodes(addedCourses, get().scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(get().customEvents)];
    const unsavedChanges = true;

    set(() => ({
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
      addedCourses,
      addedSectionCodes,
    }));
  },

  /**
   */
  deleteCourse(addedCoursesAfterDelete: AppStoreCourse[], deletedCourses: AppStoreDeletedCourse[]) {
    const addedCourses = addedCoursesAfterDelete;
    const addedSectionCodes = getSectionCodes(addedCourses, get().scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const unsavedChanges = true;
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(get().customEvents)];

    set(() => ({
      addedCourses,
      addedSectionCodes,
      deletedCourses,
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
    }));
  },

  undoDelete(deletedCourses: AppStoreDeletedCourse[]) {
    set(() => ({
      deletedCourses,
      unsavedChanges: true,
    }));
  },

  addCustomEvent(customEvent: RepeatingCustomEvent) {
    const customEvents = [...get().customEvents, customEvent];
    const finalsEventsInCalendar = calendarizeFinals(get().addedCourses);
    const unsavedChanges = true;

    const eventsInCalendar = [
      ...calendarizeCourseEvents(get().addedCourses),
      ...calendarizeCustomEvents(get().customEvents),
    ];

    set(() => ({
      customEvents,
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
    }));
  },

  deleteCustomEvent(customEventsAfterDelete: RepeatingCustomEvent[]) {
    const customEvents = customEventsAfterDelete;
    const finalsEventsInCalendar = calendarizeFinals(get().addedCourses);
    const unsavedChanges = true;
    const eventsInCalendar = [...calendarizeCourseEvents(get().addedCourses), ...calendarizeCustomEvents(customEvents)];

    set(() => ({
      customEvents,
      finalsEventsInCalendar,
      unsavedChanges,
      eventsInCalendar,
    }));
  },

  changeCustomEventColor(customEventsAfterColorChange: RepeatingCustomEvent[], color: string) {
    const customEvents = customEventsAfterColorChange;
    const finalsEventsInCalendar = calendarizeFinals(get().addedCourses);
    const unsavedChanges = true;
    const eventsInCalendar = [
      ...calendarizeCourseEvents(get().addedCourses),
      ...calendarizeCustomEvents(get().customEvents),
    ];

    set(() => ({
      customEvents,
      color,
      eventsInCalendar,
      unsavedChanges,
      finalsEventsInCalendar,
    }));
  },

  addSchedule(newScheduleNames: string[]) {
    // If the user adds a schedule, update the array of schedule names, add
    // another key/value pair to keep track of the section codes for that schedule,
    // and redirect the user to the new schedule
    const scheduleNames = newScheduleNames;
    const currentScheduleIndex = newScheduleNames.length - 1;

    const addedSectionCodes = get().addedSectionCodes;
    addedSectionCodes[newScheduleNames.length - 1] = new Set();

    set(() => ({
      currentScheduleIndex,
      scheduleNames,
      addedSectionCodes,
    }));
  },

  copySchedule(addedCourses: AppStoreCourse[], customEvents: RepeatingCustomEvent[]) {
    const addedSectionCodes = getSectionCodes(addedCourses, get().scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const unsavedChanges = true;
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(get().customEvents)];

    set(() => ({
      addedSectionCodes,
      finalsEventsInCalendar,
      unsavedChanges,
      eventsInCalendar,
      customEvents,
    }));
  },

  loadSchedule(userData: CourseData) {
    const addedCourses = userData.addedCourses;
    const scheduleNames = userData.scheduleNames;
    const addedSectionCodes = getSectionCodes(addedCourses, scheduleNames);
    const customEvents = userData.customEvents;
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(customEvents)];
    const unsavedChanges = false;

    set(() => ({
      addedCourses,
      scheduleNames,
      addedSectionCodes,
      customEvents,
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
    }));
  },
  clearSchedule(addedCoursesAfterClear: AppStoreCourse[], customEventsAfterClear: RepeatingCustomEvent[]) {
    const addedCourses = addedCoursesAfterClear;
    const customEvents = customEventsAfterClear;
    const addedSectionCodes = getSectionCodes(addedCourses, get().scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(customEvents)];
    const unsavedChanges = true;

    set(() => ({
      addedCourses,
      customEvents,
      addedSectionCodes,
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
    }));
  },

  deleteSchedule(
    newScheduleNames: string[],
    newAddedCourses: AppStoreCourse[],
    newCustomEvents: RepeatingCustomEvent[],
    newScheduleIndex: number
  ) {
    const scheduleNames = newScheduleNames;
    const addedCourses = newAddedCourses;
    const addedSectionCodes = getSectionCodes(addedCourses, scheduleNames);
    const customEvents = newCustomEvents;
    const currentScheduleIndex = newScheduleIndex;
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(customEvents)];

    set(() => ({
      scheduleNames,
      addedSectionCodes,
      addedCourses,
      customEvents,
      currentScheduleIndex,
      finalsEventsInCalendar,
      eventsInCalendar,
    }));
  },

  changeCourseColor(addedCoursesAfterColorChange: AppStoreCourse[], sectionCode: string, color: string) {
    const addedCourses = addedCoursesAfterColorChange;
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const unsavedChanges = true;

    const addedSectionCodes = getSectionCodes(addedCourses, get().scheduleNames);
    addedSectionCodes[sectionCode] = new Set();

    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(get().customEvents)];

    set(() => ({
      addedCourses,
      addedSectionCodes,
      finalsEventsInCalendar,
      eventsInCalendar,
      unsavedChanges,
      color,
    }));
  },

  openSnackbar(
    variant: VariantType,
    message: string,
    duration?: number,
    position?: SnackbarPosition,
    style?: { [cssPropertyName: string]: string }
  ) {
    const snackbarVariant = variant;
    const snackbarMessage = message;
    const snackbarDuration = duration ? duration : this.snackbarDuration;
    const snackbarPosition = position ? position : this.snackbarPosition;
    const snackbarStyle = style ? style : this.snackbarStyle;

    set(() => ({
      snackbarVariant,
      snackbarMessage,
      snackbarDuration,
      snackbarPosition,
      snackbarStyle,
    }));
  },

  toggleTheme(theme: string) {
    window.localStorage.setItem('theme', theme);
    set(() => ({ theme }));
  },
}));
