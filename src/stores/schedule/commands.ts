/**
 * functions that simulate editing commands on the schedule store,
 * e.g. undo, redo, etc.
 */

import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'

/**
 * undo change by restore the latest state from "previousStates"
 * saves un-done states to the "nextStates" stack
 */
export function undo() {
  const { schedules, scheduleIndex, previousStates, nextStates } = useScheduleStore.getState()
  const lastState = previousStates.pop()

  if (!lastState) {
    return
  }

  nextStates.push({ schedules, scheduleIndex })
  useScheduleStore.setState({ ...lastState, previousStates, nextStates, saved: false })

  logAnalytics({
    category: analyticsEnum.calendar.title,
    action: analyticsEnum.calendar.actions.UNDO,
  })
}

/**
 * redo previous undo command by restoring the latest state from "nextStates"
 * saves the re-done states to the "previousStates" stack
 */
export function redo() {
  const { schedules, scheduleIndex, nextStates, previousStates } = useScheduleStore.getState()
  const nextState = nextStates.pop()

  if (!nextState) {
    return
  }

  previousStates.push({ schedules, scheduleIndex })
  useScheduleStore.setState({ ...nextState, previousStates, nextStates, saved: false })
}
