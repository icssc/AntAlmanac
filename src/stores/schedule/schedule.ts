/**
 * functions that manage schedules in the schedule store
 */

import { useScheduleStore } from '.';

/**
 * set the schedule index of the store
 */
export function setScheduleIndex(scheduleIndex: number) {
  useScheduleStore.setState({ scheduleIndex });
}

/**
 * add a new schedule to the store
 * @param scheduleName name of the new schedule
 */
export function addSchedule(scheduleName: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState();
  previousStates.push({ schedules, scheduleIndex });
  useScheduleStore.setState({
    schedules: [...schedules, { scheduleName, courses: [], customEvents: [] }],
    scheduleIndex: schedules.length,
    previousStates,
  });
}

/**
 * rename a schedule
 * @param newScheduleName new name of the schedule
 */
export function renameCurrentSchedule(newScheduleName: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState();
  previousStates.push({ schedules, scheduleIndex });
  schedules[scheduleIndex].scheduleName = newScheduleName;
  useScheduleStore.setState({ schedules, previousStates });
}

/**
 * clear all events on the current schedule
 */
export function clearCurrentSchedule() {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState();
  previousStates.push({ schedules, scheduleIndex });
  schedules[scheduleIndex].courses = [];
  schedules[scheduleIndex].customEvents = [];
  useScheduleStore.setState({ schedules, previousStates });
}

/**
 * remove the current schedule from the schedules array
 */
export function deleteCurrentSchedule() {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState();
  previousStates.push({ schedules, scheduleIndex });
  schedules.splice(scheduleIndex, 1);

  /**
   * create an empty schedule if the last one was deleted
   */
  if (!schedules.length) {
    schedules.push({ scheduleName: 'Schedule 1', courses: [], customEvents: [] });
  }

  useScheduleStore.setState({
    schedules,
    scheduleIndex: Math.min(scheduleIndex, schedules.length - 1),
    previousStates,
  });
}
