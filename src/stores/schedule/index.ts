/**
 * basic schedule store with primitive accessors
 */

import { create } from 'zustand';
import { RepeatingCustomEvent } from '$types/event';
// import { CourseInfo, getCourseInfo, queryWebsoc } from '$lib/helpers';
import { AASection } from '$types/peterportal';

/**
 * Course as stored in schedule
 */
export interface ScheduleCourse {
  courseComment: string;
  courseNumber: string; // e.g. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  section: AASection;
  term: string;
}

/**
 * User's schedule
 */
export interface Schedule {
  scheduleName: string;
  courses: ScheduleCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * Shortened course for saving in DB
 */
interface ShortCourse {
  color: string;
  term: string;
  sectionCode: string;
}

/**
 * Schedule of short courses that is saved to DB
 */
export interface ShortCourseSchedule {
  scheduleName: string;
  courses: ShortCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * schedule save state
 */
export interface ScheduleSaveState {
  schedules: ShortCourseSchedule[];
  scheduleIndex: number;
}

/**
 * schedule undo state
 */
export interface ScheduleUndoState {
  schedules: Schedule[];
  scheduleIndex: number;
}

/**
 * the schedule store is shared state that defines some primitive operations
 * it should be extended by using the `setState` function
 */
interface ScheduleStore {
  schedules: Schedule[];
  scheduleIndex: number;
  previousStates: ScheduleUndoState[];

  getScheduleName: () => string;
  getScheduleNames: () => string[];
  getCourses: () => ScheduleCourse[];
  getAllCourses: () => ScheduleCourse[];
  getCustomEvents: () => RepeatingCustomEvent[];
  getSectionCodes: () => Set<string>;
  addUndoState: () => void;
  revertState: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  /**
   * the currently loaded schedules
   */
  schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],

  /**
   * index of current schedule
   */
  scheduleIndex: 0,

  /**
   * undo list
   */
  previousStates: [],

  /**
   * names of all schedules
   */
  getScheduleNames() {
    return get().schedules.map((schedule) => schedule.scheduleName);
  },

  /**
   * name of current schedule
   */
  getScheduleName() {
    const currentSchedules = get().schedules;
    const currentScheduleIndex = get().scheduleIndex;
    return currentSchedules[currentScheduleIndex].scheduleName;
  },

  /**
   * courses in current schedule
   */
  getCourses() {
    return get().schedules[get().scheduleIndex].courses;
  },

  /**
   * all courses in all schedules
   */
  getAllCourses() {
    const schedules = get().schedules;
    return schedules.map((schedule) => schedule.courses).flat(1);
  },

  getCustomEvents() {
    return get().schedules[get().scheduleIndex].customEvents;
  },

  /**
   * section codes
   */
  getSectionCodes() {
    const courses = get().getCourses();
    return new Set(courses.map((course) => `${course.section.sectionCode} ${course.term}`));
  },

  addUndoState() {
    const currentSchedules = get().schedules;
    const currentPreviousStates = get().previousStates;
    const currentScheduleIndex = get().scheduleIndex;
    const newPreviousState = {
      schedules: structuredClone(currentSchedules),
      scheduleIndex: currentScheduleIndex,
    };
    const previousStates = [...currentPreviousStates, newPreviousState].slice(-50);
    set({ previousStates });
  },

  /**
   * pop a state entry from the undo array and set it as the current state
   */
  revertState() {
    const state = get().previousStates.pop();
    if (state !== undefined) {
      set(state);
    }
  },
}));
