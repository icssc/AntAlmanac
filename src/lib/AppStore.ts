import { EventEmitter } from 'events';
import { VariantType } from 'notistack';
import { CourseData } from '$lib/helpers';
import { AASection } from '$lib/peterportal.types';

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
 * This one encapsulates the occurences of an event on multiple days,
 * like Monday Tuesday Wednesday all in the same object as specified by the days array.
 * The other one, `CustomEventDialog`'s CustomEvent, represents only one day,
 * like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * @see {@link https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F}
 */
export interface RepeatingCustomEvent {
  title: string;
  start: string;
  end: string;
  days: boolean[];
  scheduleIndices: number[];
  customEventID: number;
  color?: string;
}

interface CommonCalendarEvent extends Event {
  color: string;
  start: Date;
  end: Date;
  scheduleIndices: number[];
  title: string;
}

export interface CourseEvent extends CommonCalendarEvent {
  bldg: string;
  finalExam: string;
  instructors: string[];
  isCustomEvent: false;
  sectionCode: string;
  sectionType: string;
  term: string;
}

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
 * The this one represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * The other one, `CustomEventDialog`'s `RepeatingCustomEvent`,
 * encapsulates the occurences of an event on multiple days,
 * like Monday Tuesday Wednesday all in the same object as specified by the `days` array.
 * @see {@link https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F}
 */
export interface ZotCustomEvent extends CommonCalendarEvent {
  customEventID: number;
  isCustomEvent: true;
}

export type CalendarEvent = CourseEvent | ZotCustomEvent;

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

export interface AppStoreCourse {
  color: string;
  courseComment: string;
  courseNumber: string; //i.e. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  scheduleIndices: number[];
  section: AASection;
  term: string;
}

export interface AppStoreDeletedCourse extends AppStoreCourse {
  scheduleIndex: number;
}

class AppStore extends EventEmitter {
  currentScheduleIndex: number;
  customEvents: RepeatingCustomEvent[];
  addedCourses: AppStoreCourse[];
  addedSectionCodes: { [key: number]: Set<string> };
  colorPickers: { [key: string]: EventEmitter };
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

  constructor() {
    super();
    this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
    this.currentScheduleIndex = 0;
    this.customEvents = [];
    this.addedCourses = [];
    this.addedSectionCodes = { 0: new Set() };
    this.colorPickers = {};
    this.deletedCourses = [];
    this.snackbarMessage = '';
    this.snackbarVariant = 'info';
    this.snackbarDuration = 3000;
    this.snackbarPosition = { vertical: 'bottom', horizontal: 'left' };
    this.snackbarStyle = {};
    this.eventsInCalendar = [];
    this.finalsEventsInCalendar = [];
    this.unsavedChanges = false;
    this.scheduleNames = ['Schedule 1'];
    this.theme = (() => {
      // either 'light', 'dark', or 'auto'
      const theme = typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('theme');
      return theme === null ? 'auto' : theme;
    })();

    window.addEventListener('beforeunload', (event) => {
      if (this.unsavedChanges) {
        event.returnValue = `Are you sure you want to leave? You have unsaved changes!`;
      }
    });
  }

  getCurrentScheduleIndex() {
    return this.currentScheduleIndex;
  }

  getScheduleNames() {
    return this.scheduleNames;
  }

  getAddedCourses() {
    return this.addedCourses;
  }

  addCourse(newCourse: AppStoreCourse) {
    this.addedCourses = this.addedCourses.concat(newCourse);
    this.updateAddedSectionCodes();
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
  }

  /**
   * This gets run when you add the same section code to multiple schedules.
   */
  addSection(newSection: AppStoreCourse) {
    this.addedCourses = this.addedCourses.map((course) => {
      if (course.section.sectionCode === newSection.section.sectionCode) return newSection;
      else return course;
    });
    this.updateAddedSectionCodes();
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
  }

  getCustomEvents() {
    // Note: remove this forEach loop after Spring 2022 ends
    this.customEvents.forEach((customEvent) => {
      if (customEvent.days.length === 5) {
        customEvent.days = [false, ...customEvent.days, false];
      } else if (customEvent.days.length === 6) {
        customEvent.days = [...customEvent.days, false];
      }
    });

    return this.customEvents;
  }

  getEventsInCalendar() {
    return this.eventsInCalendar;
  }

  getFinalEventsInCalendar() {
    return this.finalsEventsInCalendar;
  }

  getDeletedCourses() {
    return this.deletedCourses;
  }

  getSnackbarMessage() {
    return this.snackbarMessage;
  }

  getSnackbarVariant() {
    return this.snackbarVariant;
  }

  getSnackbarPosition() {
    return this.snackbarPosition;
  }

  getSnackbarDuration() {
    return this.snackbarDuration;
  }

  getSnackbarStyle() {
    return this.snackbarStyle;
  }

  getTheme() {
    return this.theme;
  }

  getAddedSectionCodes() {
    return this.addedSectionCodes;
  }

  hasUnsavedChanges() {
    return this.unsavedChanges;
  }

  updateAddedSectionCodes() {
    this.addedSectionCodes = {};

    for (let i = 0; i < this.scheduleNames.length; i++) {
      this.addedSectionCodes[i] = new Set();
    }

    for (const course of this.addedCourses) {
      for (const scheduleIndex of course.scheduleIndices) {
        this.addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
      }
    }
  }

  registerColorPicker(id: string, update: (color: string) => void) {
    if (id in this.colorPickers) {
      this.colorPickers[id].on('colorChange', update);
    } else {
      this.colorPickers[id] = new EventEmitter();
      this.colorPickers[id].on('colorChange', update);
    }
  }

  unregisterColorPicker(id: string, update: (color: string) => void) {
    if (id in this.colorPickers) {
      this.colorPickers[id].removeListener('colorChange', update);
      if (this.colorPickers[id].listenerCount('colorChange') === 0) {
        delete this.colorPickers[id];
      }
    }
  }

  deleteCourse(addedCoursesAfterDelete: AppStoreCourse[], deletedCourses: AppStoreDeletedCourse[]) {
    this.addedCourses = addedCoursesAfterDelete;
    this.updateAddedSectionCodes();
    this.deletedCourses = deletedCourses;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
  }

  undoDelete(deletedCourses: AppStoreDeletedCourse[]) {
    this.deletedCourses = deletedCourses;
    this.unsavedChanges = true;
  }

  addCustomEvent(customEvent: RepeatingCustomEvent) {
    this.customEvents = this.customEvents.concat(customEvent);
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  editCustomEvent(customEventsAfterEdit: RepeatingCustomEvent[]) {
    this.customEvents = customEventsAfterEdit;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  deleteCustomEvent(customEventsAfterDelete: RepeatingCustomEvent[]) {
    this.customEvents = customEventsAfterDelete;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('customEventsChange');
  }

  changeCustomEventColor(
    customEventsAfterColorChange: RepeatingCustomEvent[],
    customEventID: number,
    newColor: string
  ) {
    this.customEvents = customEventsAfterColorChange;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.colorPickers[customEventID].emit('colorChange', newColor);
    this.emit('colorChange', false);
  }

  addSchedule(newScheduleNames: string[]) {
    // If the user adds a schedule, update the array of schedule names, add
    // another key/value pair to keep track of the section codes for that schedule,
    // and redirect the user to the new schedule
    this.scheduleNames = newScheduleNames;
    this.addedSectionCodes[newScheduleNames.length - 1] = new Set();
    this.currentScheduleIndex = newScheduleNames.length - 1;
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
  }

  renameSchedule(newScheduleNames: string[]) {
    this.scheduleNames = newScheduleNames;
    this.emit('scheduleNamesChange');
  }

  saveSchedule() {
    this.unsavedChanges = false;
  }

  copySchedule(addedCoursesAfterCopy: AppStoreCourse[], customEventsAfterCopy: RepeatingCustomEvent[]) {
    this.addedCourses = addedCoursesAfterCopy;
    this.updateAddedSectionCodes();
    this.customEvents = customEventsAfterCopy;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }

  loadSchedule(userData: CourseData) {
    this.addedCourses = userData.addedCourses;
    this.scheduleNames = userData.scheduleNames;
    this.updateAddedSectionCodes();
    this.customEvents = userData.customEvents;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = false;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
    this.emit('scheduleNamesChange');
  }

  changeCurrentSchedule(newScheduleIndex: number) {
    this.currentScheduleIndex = newScheduleIndex;
    this.emit('currentScheduleIndexChange');
  }

  clearSchedule(addedCoursesAfterClear: AppStoreCourse[], customEventsAfterClear: RepeatingCustomEvent[]) {
    this.addedCourses = addedCoursesAfterClear;
    this.updateAddedSectionCodes();
    this.customEvents = customEventsAfterClear;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }

  deleteSchedule(
    newScheduleNames: string[],
    newAddedCourses: AppStoreCourse[],
    newCustomEvents: RepeatingCustomEvent[],
    newScheduleIndex: number
  ) {
    this.scheduleNames = newScheduleNames;
    this.addedCourses = newAddedCourses;
    this.updateAddedSectionCodes();
    this.customEvents = newCustomEvents;
    this.currentScheduleIndex = newScheduleIndex;
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.emit('scheduleNamesChange');
    this.emit('currentScheduleIndexChange');
    this.emit('addedCoursesChange');
    this.emit('customEventsChange');
  }

  changeCourseColor(addedCoursesAfterColorChange: AppStoreCourse[], sectionCode: string, newColor: string) {
    this.addedCourses = addedCoursesAfterColorChange;
    this.updateAddedSectionCodes();
    this.finalsEventsInCalendar = calendarizeFinals();
    this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
    this.unsavedChanges = true;
    this.colorPickers[sectionCode].emit('colorChange', newColor);
    this.emit('colorChange', false);
  }

  openSnackbar(
    variant: VariantType,
    message: string,
    duration?: number,
    position?: SnackbarPosition,
    style?: { [cssPropertyName: string]: string }
  ) {
    this.snackbarVariant = variant;
    this.snackbarMessage = message;
    this.snackbarDuration = duration ? duration : this.snackbarDuration;
    this.snackbarPosition = position ? position : this.snackbarPosition;
    this.snackbarStyle = style ? style : this.snackbarStyle;
    this.emit('openSnackbar'); // sends event to NotificationSnackbar
  }

  toggleTheme(theme: string) {
    this.theme = theme;
    this.emit('themeToggle');
    window.localStorage.setItem('theme', theme);
  }
}

const store = new AppStore();
export default store;

export const calendarizeCourseEvents = () => {
  const addedCourses = store.getAddedCourses();
  const courseEventsInCalendar: CourseEvent[] = [];

  for (const course of addedCourses) {
    for (const meeting of course.section.meetings) {
      const timeString = meeting.time.replace(/\s/g, '');

      if (timeString !== 'TBA') {
        const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString.match(
          /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
        ) as RegExpMatchArray;

        let startHr = parseInt(startHrStr, 10);
        const startMin = parseInt(startMinStr, 10);
        let endHr = parseInt(endHrStr, 10);
        const endMin = parseInt(endMinStr, 10);

        const dates = [
          meeting.days.includes('Su'),
          meeting.days.includes('M'),
          meeting.days.includes('Tu'),
          meeting.days.includes('W'),
          meeting.days.includes('Th'),
          meeting.days.includes('F'),
          meeting.days.includes('Sa'),
        ];

        if (ampm === 'p' && endHr !== 12) {
          startHr += 12;
          endHr += 12;
          if (startHr > endHr) startHr -= 12;
        }

        dates.forEach((shouldBeInCal, index) => {
          if (shouldBeInCal) {
            const newEvent = {
              color: course.color,
              term: course.term,
              title: course.deptCode + ' ' + course.courseNumber,
              courseTitle: course.courseTitle,
              bldg: meeting.bldg,
              instructors: course.section.instructors,
              sectionCode: course.section.sectionCode,
              sectionType: course.section.sectionType,
              start: new Date(2018, 0, index, startHr, startMin),
              finalExam: course.section.finalExam,
              end: new Date(2018, 0, index, endHr, endMin),
              isCustomEvent: false as const,
              scheduleIndices: course.scheduleIndices,
            };

            courseEventsInCalendar.push(newEvent as any);
          }
        });
      }
    }
  }

  return courseEventsInCalendar;
};

export const calendarizeFinals = () => {
  const addedCourses = store.getAddedCourses();
  const finalsEventsInCalendar = [] as CourseEvent[];

  for (const course of addedCourses) {
    const finalExam = course.section.finalExam;
    if (finalExam.length > 5) {
      const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = finalExam.match(
        /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
      ) as RegExpMatchArray;
      // TODO: this block is almost the same as in calenarizeCourseEvents. we should refactor to remove the duplicate code.
      let startHour = parseInt(startStr, 10);
      const startMin = parseInt(startMinStr, 10);
      let endHour = parseInt(endStr, 10);
      const endMin = parseInt(endMinStr, 10);
      const weekdayInclusion: boolean[] = [
        date.includes('Sat'),
        date.includes('Sun'),
        date.includes('Mon'),
        date.includes('Tue'),
        date.includes('Wed'),
        date.includes('Thu'),
        date.includes('Fri'),
      ];
      if (ampm === 'pm' && endHour !== 12) {
        startHour += 12;
        endHour += 12;
        if (startHour > endHour) startHour -= 12;
      }

      weekdayInclusion.forEach((shouldBeInCal, index) => {
        if (shouldBeInCal)
          finalsEventsInCalendar.push({
            title: course.deptCode + ' ' + course.courseNumber,
            sectionCode: course.section.sectionCode,
            sectionType: 'Fin',
            bldg: course.section.meetings[0].bldg,
            color: course.color,
            scheduleIndices: course.scheduleIndices,
            start: new Date(2018, 0, index - 1, startHour, startMin),
            end: new Date(2018, 0, index - 1, endHour, endMin),
            finalExam: course.section.finalExam,
            instructors: course.section.instructors,
            term: course.term,
            isCustomEvent: false,
          } as any);
      });
    }
  }

  return finalsEventsInCalendar;
};

export const calendarizeCustomEvents = () => {
  const customEvents = store.getCustomEvents();
  const customEventsInCalendar = [];

  for (const customEvent of customEvents) {
    for (let dayIndex = 0; dayIndex < customEvent.days.length; dayIndex++) {
      if (customEvent.days[dayIndex]) {
        const startHour = parseInt(customEvent.start.slice(0, 2), 10);
        const startMin = parseInt(customEvent.start.slice(3, 5), 10);
        const endHour = parseInt(customEvent.end.slice(0, 2), 10);
        const endMin = parseInt(customEvent.end.slice(3, 5), 10);

        customEventsInCalendar.push({
          customEventID: customEvent.customEventID,
          color: customEvent.color,
          start: new Date(2018, 0, dayIndex, startHour, startMin),
          isCustomEvent: true,
          end: new Date(2018, 0, dayIndex, endHour, endMin),
          scheduleIndices: customEvent.scheduleIndices,
          title: customEvent.title,
        });
      }
    }
  }

  return customEventsInCalendar as ZotCustomEvent[];
};
