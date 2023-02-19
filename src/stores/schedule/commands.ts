/**
 * functions that simulate editing commands on the schedule store,
 * e.g. undo, redo, etc.
 */

import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'

/**
 * restore the latest state from the saved states
 */
export function undo() {
  const { schedules, scheduleIndex, previousStates, nextStates } = useScheduleStore.getState()
  const lastState = previousStates.pop()
  if (!lastState) {
    return
  }
  nextStates.push({ schedules, scheduleIndex })
  useScheduleStore.setState({ schedules: lastState.schedules, previousStates, nextStates })
  logAnalytics({
    category: analyticsEnum.calendar.title,
    action: analyticsEnum.calendar.actions.UNDO,
  })
}

/**
 * experimental function to redo previous undo commands
 */
export function redo() {
  const { schedules, scheduleIndex, nextStates, previousStates } = useScheduleStore.getState()
  const nextState = nextStates.pop()
  if (!nextState) {
    return
  }
  previousStates.push({ schedules, scheduleIndex })
  useScheduleStore.setState({ schedules: nextState.schedules, previousStates, nextStates })
}
