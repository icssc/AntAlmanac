/**
 * functions that manage schedules in the schedule store
 */

import { useScheduleStore } from '.'

/**
 * set the schedule index of the store
 */
export function setScheduleIndex(scheduleIndex: number) {
  useScheduleStore.setState({ scheduleIndex })
}

/**
 * add a new schedule to the store
 * @param scheduleName name of the new schedule
 */
export function addSchedule(scheduleName: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
  useScheduleStore.setState({
    schedules: [...schedules, { scheduleName, courses: [], customEvents: [] }],
    scheduleIndex: schedules.length,
    previousStates,
    saved: false,
  })
}

/**
 * rename a schedule
 * @param newScheduleName new name of the schedule
 */
export function renameCurrentSchedule(newScheduleName: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
  schedules[scheduleIndex].scheduleName = newScheduleName
  useScheduleStore.setState({ schedules, previousStates, saved: false })
}

/**
 * clear all events on the current schedule
 */
export function clearCurrentSchedule() {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  if (schedules[scheduleIndex].courses.length === 0 && schedules[scheduleIndex].customEvents.length === 0) {
    return
  }
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
  schedules[scheduleIndex].courses = []
  schedules[scheduleIndex].customEvents = []
  useScheduleStore.setState({ schedules, previousStates, saved: false })
}

/**
 * remove the current schedule from the schedules array
 */
export function deleteCurrentSchedule() {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
  schedules.splice(scheduleIndex, 1)

  /**
   * create an empty schedule if the last one was deleted
   */
  if (!schedules.length) {
    schedules.push({ scheduleName: 'Schedule 1', courses: [], customEvents: [] })
  }

  useScheduleStore.setState({
    schedules,
    scheduleIndex: Math.min(scheduleIndex, schedules.length - 1),
    previousStates,
    saved: false,
  })
}
