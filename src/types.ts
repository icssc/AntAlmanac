import { AASection } from '$lib/peterportal.types';

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

export interface CommonCalendarEvent extends Partial<Event> {
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

export interface CourseData {
  addedCourses: AppStoreCourse[];
  scheduleNames: string[];
  customEvents: RepeatingCustomEvent[];
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
