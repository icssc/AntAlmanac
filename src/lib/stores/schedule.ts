import { create } from 'zustand';
import { AppStoreCourse, CourseEvent, RepeatingCustomEvent, ZotCustomEvent } from '../../types';

/**
 */
export function getSectionCodes(addedCourses: AppStoreCourse[], scheduleNames: string[]) {
  const addedSectionCodes = {};

  for (let i = 0; i < scheduleNames.length; i++) {
    addedSectionCodes[i] = new Set();
  }

  for (const course of addedCourses) {
    for (const scheduleIndex of course.scheduleIndices) {
      addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
    }
  }
  return addedSectionCodes;
}

/**
 */
export function calendarizeCourseEvents(addedCourses: AppStoreCourse[]) {
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
}

export function calendarizeCustomEvents(customEvents: RepeatingCustomEvent[]) {
  const customEventsInCalendar: ZotCustomEvent[] = [];

  for (const customEvent of customEvents) {
    for (let dayIndex = 0; dayIndex < customEvent.days.length; dayIndex++) {
      if (customEvent.days[dayIndex]) {
        const startHour = parseInt(customEvent.start.slice(0, 2), 10);
        const startMin = parseInt(customEvent.start.slice(3, 5), 10);
        const endHour = parseInt(customEvent.end.slice(0, 2), 10);
        const endMin = parseInt(customEvent.end.slice(3, 5), 10);

        customEventsInCalendar.push({
          customEventID: customEvent.customEventID,
          color: customEvent.color || '',
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
}

export function calendarizeFinals(addedCourses: AppStoreCourse[]) {
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
}

// import { AASection } from '$lib/peterportal.types';
//
// export interface AppStoreCourse {
//   color: string;
//   courseComment: string;
//   courseNumber: string; //i.e. 122a
//   courseTitle: string;
//   deptCode: string;
//   prerequisiteLink: string;
//   scheduleIndices: number[];
//   section: AASection;
//   term: string;
// }
//
// export interface CommonCalendarEvent extends Partial<Event> {
//   color: string;
//   start: Date;
//   end: Date;
//   scheduleIndices: number[];
//   title: string;
// }
//
// export interface CourseEvent extends CommonCalendarEvent {
//   bldg: string;
//   finalExam: string;
//   instructors: string[];
//   isCustomEvent: false;
//   sectionCode: string;
//   sectionType: string;
//   term: string;
// }
//
// /**
//  * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
//  * This one encapsulates the occurences of an event on multiple days,
//  * like Monday Tuesday Wednesday all in the same object as specified by the days array.
//  * The other one, `CustomEventDialog`'s CustomEvent, represents only one day,
//  * like the event on Monday, and needs to be duplicated to be repeated across multiple days.
//  * @see {@link https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F}
//  */
// export interface RepeatingCustomEvent {
//   title: string;
//   start: string;
//   end: string;
//   days: boolean[];
//   scheduleIndices: number[];
//   customEventID: number;
//   color?: string;
// }
//
// /**
//  * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
//  * The this one represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
//  * The other one, `CustomEventDialog`'s `RepeatingCustomEvent`,
//  * encapsulates the occurences of an event on multiple days,
//  * like Monday Tuesday Wednesday all in the same object as specified by the `days` array.
//  * @see {@link https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F}
//  */
// export interface ZotCustomEvent extends CommonCalendarEvent {
//   customEventID: number;
//   isCustomEvent: true;
// }
//
// export type CalendarEvent = CourseEvent | ZotCustomEvent;
//
// export interface CourseData {
//   addedCourses: AppStoreCourse[];
//   scheduleNames: string[];
//   customEvents: RepeatingCustomEvent[];
// }
//
// export interface SnackbarPosition {
//   horizontal: 'left' | 'right';
//   vertical: 'bottom' | 'top';
// }
//
// export interface ShortCourseInfo {
//   color: string;
//   term: string;
//   sectionCode: string;
//   scheduleIndices: number[];
// }
// export interface UserData {
//   addedCourses: ShortCourseInfo[];
//   scheduleNames: string[];
//   customEvents: RepeatingCustomEvent[];
// }
//
// export interface AppStoreDeletedCourse extends AppStoreCourse {
//   scheduleIndex: number;
// }

/**
 * shared schedule store
 */
export interface ScheduleStore {
  currentScheduleIndex: number;
  customEvents: RepeatingCustomEvent[];
  addedCourses: AppStoreCourse[];
  addedSectionCodes: { [key: number]: Set<string> };
  deletedCourses: AppStoreDeletedCourse[];
  eventsInCalendar: CalendarEvent[];
  finalsEventsInCalendar: CourseEvent[];
  scheduleNames: string[];
  unsavedChanges: boolean;

  addCourse: (newCourse: AppStoreCourse) => void;
  addSection(newSection: AppStoreCourse): void;
  deleteCourse: (addedCourses: AppStoreCourse[], deletedCourses: AppStoreDeletedCourse[]) => void;
  undoDelete: (deletedCourses: AppStoreDeletedCourse[]) => void;
  addCustomEvent: (newCustomEvent: RepeatingCustomEvent) => void;
  deleteCustomEvent: (customEvents: RepeatingCustomEvent[]) => void;
  changeCustomEventColor: (customEvents: RepeatingCustomEvent[], color: string) => void;
  addSchedule: (scheduleNames: string[]) => void;
  copySchedule: (addedCourses: AppStoreCourse[], customEvents: RepeatingCustomEvent[]) => void;
  loadSchedule: (userData: CourseData) => void;
  clearSchedule: (addedCourses: AppStoreCourse[], customEvents: RepeatingCustomEvent[]) => void;
  deleteSchedule: (
    scheduleNames: string[],
    addedCourses: AppStoreCourse[],
    customEvents: RepeatingCustomEvent[],
    currentScheduleIndex: number
  ) => void;
  changeCourseColor: (addedCourses: AppStoreCourse[], sectionCode: string, color: string) => void;
}

export const useAppStore = create<ScheduleStore>((set, get) => ({
  currentScheduleIndex: 0,
  customEvents: [],
  addedCourses: [],
  addedSectionCodes: { 0: new Set() },
  deletedCourses: [],
  eventsInCalendar: [],
  finalsEventsInCalendar: [],
  unsavedChanges: false,
  scheduleNames: ['Schedule 1'],

  addCourse(newCourse: AppStoreCourse) {
    const currentStoreValues = get();

    const currentAddedCourses = currentStoreValues.addedCourses;
    const currentCustomEvents = currentStoreValues.customEvents;

    const addedCourses = [...currentAddedCourses, newCourse];

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(currentCustomEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const finalsEventsInCalendar = calendarizeFinals(addedCourses);

    const unsavedChanges = true;

    set(() => ({
      addedCourses,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },

  addSection(newSection: AppStoreCourse) {
    const currentStoreValues = get();

    const addedCourses = currentStoreValues.addedCourses.map((course) =>
      course.section.sectionCode === newSection.section.sectionCode ? newSection : course
    );

    const currentScheduleNames = currentStoreValues.scheduleNames;
    const currentCustomEvents = currentStoreValues.customEvents;

    const addedSectionCodes = getSectionCodes(addedCourses, currentScheduleNames);

    const finalsEventsInCalendar = calendarizeFinals(addedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(currentCustomEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    set(() => ({
      addedCourses,
      addedSectionCodes,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },

  deleteCourse(addedCourses: AppStoreCourse[], deletedCourses: AppStoreDeletedCourse[]) {
    const currentStoreValues = get();

    const currentScheduleNames = currentStoreValues.scheduleNames;
    const currentCustomEvents = currentStoreValues.customEvents;

    const addedSectionCodes = getSectionCodes(addedCourses, currentScheduleNames);

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(currentCustomEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const unsavedChanges = true;

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
    const currentStoreValues = get();

    const currentCustomEvents = currentStoreValues.customEvents;
    const currentAddedCourses = currentStoreValues.addedCourses;

    const customEvents = [...currentCustomEvents, customEvent];
    const finalsEventsInCalendar = calendarizeFinals(currentAddedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(currentAddedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(customEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    set(() => ({
      customEvents,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },

  deleteCustomEvent(customEvents: RepeatingCustomEvent[]) {
    const currentStoreValues = get();

    const currentAddedCourses = currentStoreValues.addedCourses;

    const finalsEventsInCalendar = calendarizeFinals(currentAddedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(currentAddedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(customEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    set(() => ({
      customEvents,
      finalsEventsInCalendar,
      unsavedChanges,
      eventsInCalendar,
    }));
  },

  changeCustomEventColor(customEvents: RepeatingCustomEvent[], color: string) {
    const currentStoreValues = get();

    const currentAddedCourses = currentStoreValues.addedCourses;

    const finalsEventsInCalendar = calendarizeFinals(currentAddedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(currentAddedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(customEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    // TODO: change color
    console.log(color, 'please implement me!');

    set(() => ({
      customEvents,
      eventsInCalendar,
      unsavedChanges,
      finalsEventsInCalendar,
    }));
  },

  /**
   * If the user adds a schedule:
   * 1) update the array of schedule names,
   * 2) add another key/value pair to keep track of the section codes for that schedule,
   * 3) redirect the user to the new schedule
   */
  addSchedule(scheduleNames: string[]) {
    const currentSectionCodes = get().addedSectionCodes;
    const currentScheduleIndex = scheduleNames.length - 1;
    const addedSectionCodes = currentSectionCodes;
    addedSectionCodes[scheduleNames.length - 1] = new Set();

    set(() => ({
      currentScheduleIndex,
      scheduleNames,
      addedSectionCodes,
    }));
  },

  copySchedule(addedCourses: AppStoreCourse[], customEvents: RepeatingCustomEvent[]) {
    const currentStoreValues = get();

    const currentScheduleNames = currentStoreValues.scheduleNames;

    const addedSectionCodes = getSectionCodes(addedCourses, currentScheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(customEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    set(() => ({
      customEvents,
      addedSectionCodes,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },

  loadSchedule(userData: CourseData) {
    const addedCourses = userData.addedCourses;
    const scheduleNames = userData.scheduleNames;
    const customEvents = userData.customEvents;
    const addedSectionCodes = getSectionCodes(addedCourses, scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(customEvents)];
    const unsavedChanges = false;

    set(() => ({
      addedCourses,
      addedSectionCodes,
      customEvents,
      scheduleNames,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },
  clearSchedule(addedCourses: AppStoreCourse[], customEvents: RepeatingCustomEvent[]) {
    const currentStoreValues = get();
    const currentScheduleNames = currentStoreValues.scheduleNames;

    const addedSectionCodes = getSectionCodes(addedCourses, currentScheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(customEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    const unsavedChanges = true;

    set(() => ({
      addedCourses,
      customEvents,
      addedSectionCodes,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },

  deleteSchedule(
    scheduleNames: string[],
    addedCourses: AppStoreCourse[],
    customEvents: RepeatingCustomEvent[],
    currentScheduleIndex: number
  ) {
    const addedSectionCodes = getSectionCodes(addedCourses, scheduleNames);
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const eventsInCalendar = [...calendarizeCourseEvents(addedCourses), ...calendarizeCustomEvents(customEvents)];

    set(() => ({
      addedCourses,
      customEvents,
      addedSectionCodes,
      scheduleNames,
      currentScheduleIndex,
      eventsInCalendar,
      finalsEventsInCalendar,
    }));
  },

  changeCourseColor(addedCoursesAfterColorChange: AppStoreCourse[], sectionCode: string, color: string) {
    const currentStoreValues = get();
    const currentScheduleNames = currentStoreValues.scheduleNames;
    const currentCustomEvents = currentStoreValues.customEvents;

    const addedCourses = addedCoursesAfterColorChange;
    const finalsEventsInCalendar = calendarizeFinals(addedCourses);
    const unsavedChanges = true;

    const addedSectionCodes = getSectionCodes(addedCourses, currentScheduleNames);
    addedSectionCodes[sectionCode] = new Set();

    const calendarCourseEvents = calendarizeCourseEvents(addedCourses);
    const calendarCustomEvents = calendarizeCustomEvents(currentCustomEvents);
    const eventsInCalendar = [...calendarCourseEvents, ...calendarCustomEvents];

    // TODO: change the color
    console.log(color, 'please implement change color');

    set(() => ({
      addedCourses,
      addedSectionCodes,
      eventsInCalendar,
      finalsEventsInCalendar,
      unsavedChanges,
    }));
  },
}));
