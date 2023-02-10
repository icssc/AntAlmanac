/**
 * basic schedule store with primitive accessors
 */

import { create } from 'zustand';
import { RepeatingCustomEvent } from '$types/event';
import { AASection } from '$types/peterportal';

/**
 * user's schedule
 */
interface Schedule {
  scheduleName: string;
  courses: ScheduleCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * shortened course for saving in DB
 */
interface ShortCourse {
  color: string;
  term: string;
  sectionCode: string;
}

/**
 * schedule undo state
 */
interface ScheduleUndoState {
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
  addUndoState: () => void;
  revertState: () => void;
}

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
 * schedule of short courses that is saved to DB
 */
export interface ShortCourseSchedule {
  scheduleName: string;
  courses: ShortCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * store (shared state) with info about the current schedules
 */
export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  /**
   * currently loaded schedules
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
   * add the current state into the undo array
   */
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
