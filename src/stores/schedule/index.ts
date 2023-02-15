/**
 * basic schedule store with primitive accessors
 */

import { create } from 'zustand'
import type { AASection } from '$types/peterportal'

/** There is another CustomEvent interface in CourseCalendarEvent and they are slightly different.
 * This one encapsulates the occurences of an event on multiple days,
 * like Monday Tuesday Wednesday all in the same object as specified by the days array.
 * The other one, `CustomEventDialog`'s CustomEvent, represents only one day,
 * like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * @see {@link https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F}
 */

export interface RepeatingCustomEvent {
  title: string
  start: string
  end: string
  days: boolean[]
  customEventID: number
  color?: string
}

/**
 * course
 */
export interface Course {
  courseComment: string
  courseNumber: string //i.e. 122a
  courseTitle: string
  deptCode: string
  prerequisiteLink: string
  section: AASection
  term: string
}

/**
 * schedule
 */
export interface Schedule {
  scheduleName: string
  courses: Course[]
  customEvents: RepeatingCustomEvent[]
}

/**
 * schedule undo state
 */
export interface ScheduleUndoState {
  schedules: Schedule[]
  scheduleIndex: number
}

/**
 * interface for the schedule store
 */
interface ScheduleStore {
  /**
   * all schedules
   */
  schedules: Schedule[]

  /**
   * index of currently selected schedule
   */
  scheduleIndex: number

  /**
   * undo tree
   */
  previousStates: ScheduleUndoState[]
}

/**
 * store (shared state) with info about the current schedules
 */
export const useScheduleStore = create<ScheduleStore>((_set, _get) => ({
  schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],

  scheduleIndex: 0,

  previousStates: [],
}))
