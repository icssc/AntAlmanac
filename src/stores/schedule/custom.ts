/**
 * functions that manage custom events in the schedule store
 */

import { useScheduleStore } from '.';
import { RepeatingCustomEvent } from '$types/event';

/**
 * Checks if a schedule contains the custom event ID
 * @param customEventId
 * @param scheduleIndex
 */
export function doesCustomEventExistInSchedule(customEventId: number, scheduleIndex: number) {
  const { schedules } = useScheduleStore.getState();
  return schedules[scheduleIndex].customEvents.some((customEvent) => customEvent.customEventID === customEventId);
}

/**
 * add a custom event to multiple schedules
 * @param newCustomEvent custom event
 * @param scheduleIndices indices of schedules to add the custom event to
 */
export function addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
  const { addUndoState, schedules, scheduleIndex } = useScheduleStore.getState();
  addUndoState();
  const customEvents = schedules[scheduleIndex].customEvents;
  for (const scheduleIndex of scheduleIndices) {
    if (!customEvents.some((customEvent) => customEvent.customEventID === newCustomEvent.customEventID)) {
      schedules[scheduleIndex].customEvents.push(newCustomEvent);
    }
  }
  useScheduleStore.setState({ schedules });
}

/**
 * delete a custom event
 * @param customEventId custom event ID to delete
 * @param scheduleIndices indices of schedules to remove the custom event from
 */
export function deleteCustomEvent(
  customEventId: number,
  scheduleIndices: number[] = [useScheduleStore.getState().scheduleIndex]
) {
  const { addUndoState, schedules } = useScheduleStore.getState();
  addUndoState();
  for (const scheduleIndex of scheduleIndices) {
    const customEvents = schedules[scheduleIndex].customEvents;
    const index = customEvents.findIndex((customEvent) => customEvent.customEventID === customEventId);
    if (index !== undefined) {
      customEvents.splice(index, 1);
    }
  }
  useScheduleStore.setState({ schedules });
}

/**
 * Replaces properties of custom event with ones from editedCustomEvent and moves the custom event to newIndices.
 * Edits the custom event object itself so all references are edited.
 * @param editedCustomEvent
 * @param newIndices
 */
export function editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newIndices: number[]) {
  const { addUndoState, schedules, scheduleIndex } = useScheduleStore.getState();
  addUndoState();
  const customEvents = schedules[scheduleIndex].customEvents;
  let customEvent = customEvents.find((event) => event.customEventID === editedCustomEvent.customEventID);

  if (customEvent === undefined) {
    addCustomEvent(editedCustomEvent, newIndices);
    return;
  }

  // Modify the original custom event so all references are updated as well
  customEvent = { ...customEvent, ...editedCustomEvent };

  const currentIndices = [...schedules.keys()].filter((index) =>
    schedules[index].customEvents.some((event) => event.customEventID === editedCustomEvent.customEventID)
  );

  /**
   * currentIndices minus newIndices
   */
  const indicesToDelete = currentIndices.filter((index) => !newIndices.includes(index));
  deleteCustomEvent(customEvent.customEventID, indicesToDelete);

  /**
   * newIndices minus currentIndices
   */
  const indicesToAdd = newIndices.filter((index) => !currentIndices.includes(index));
  addCustomEvent(customEvent, indicesToAdd);
}

/**
 * change color of custom event
 * @param customEventId ID of custom event
 * @param newColor color
 */
export function changeCustomEventColor(customEventId: number, newColor: string) {
  const { addUndoState, schedules, scheduleIndex } = useScheduleStore.getState();
  addUndoState();
  const customEvents = schedules[scheduleIndex].customEvents;
  const customEvent = customEvents.find((event) => event.customEventID === customEventId);
  if (customEvent) {
    customEvent.color = newColor;
    useScheduleStore.setState({ schedules });
  }
}
