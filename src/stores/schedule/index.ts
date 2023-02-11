/**
 * basic schedule store with primitive accessors
 */

import { create } from 'zustand';
import { AASection } from '$types/peterportal';

/* There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
 * This one encapsulates the occurences of an event on multiple days, like Monday Tuesday Wednesday all in the same object as specified by the days array. The other one, `CustomEventDialog`'s CustomEvent, represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F
 */
export interface RepeatingCustomEvent {
  title: string;
  start: string;
  end: string;
  days: boolean[];
  customEventID: number;
  color?: string;
}

/**
 * course
 */
export interface Course {
  courseComment: string;
  courseNumber: string; // e.g. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  section: AASection;
  term: string;
}

/**
 * schedule
 */
interface Schedule {
  scheduleName: string;
  courses: Course[];
  customEvents: RepeatingCustomEvent[];
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
 * it can be extended with functions that invoke its `getState` and `setState` methods
 */
interface ScheduleStore {
  schedules: Schedule[];
  scheduleIndex: number;
  previousStates: ScheduleUndoState[];
  addUndoState: () => void;
  revertState: () => void;
  currentSchedule: () => Schedule;
}

/**
 * store (shared state) with info about the current schedules
 */
export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  /**
   * array of currently loaded schedules
   */
  schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],

  /**
   * array index of currently selected schedule
   */
  scheduleIndex: 0,

  /**
   * array of previous states
   */
  previousStates: [],

  /**
   * returns currently selected schedule
   */
  currentSchedule() {
    const { schedules, scheduleIndex } = get();
    return schedules[scheduleIndex];
  },

  /**
   * append current state onto the undo array
   */
  addUndoState() {
    const { schedules, scheduleIndex, previousStates } = get();
    previousStates.push({
      schedules,
      scheduleIndex,
    });

    /**
     * limit undo states to most recent 50
     */
    set({ previousStates: previousStates.slice(-50) });
  },

  /**
   * pop a state from the undo array and set it as the current state
   */
  revertState() {
    const { previousStates } = get();
    const previousState = previousStates.pop();
    set({ previousStates, ...previousState });
  },
}));
