/**
 * basic schedule store with primitive accessors
 *
 * all other files in this folder are de-coupled from one another,
 * and only extend this store's functionality
 */

import { create } from 'zustand'
import type { Schedule } from '@packages/types'

/**
 * saved schedule in memory
 */
export interface ScheduleUndoState {
  schedules: Schedule[]
  scheduleIndex: number
}

export interface ScheduleStore {
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

  /**
   * redo tree
   */
  nextStates: ScheduleUndoState[]

  /**
   * whether the schedule's been saved
   */
  saved: boolean
}

/**
 * hook to access the store (shared state) with info about the current schedules
 */
export const useScheduleStore = create<ScheduleStore>(() => ({
  schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],
  scheduleIndex: 0,
  previousStates: [],
  nextStates: [],
  saved: true,
}))
