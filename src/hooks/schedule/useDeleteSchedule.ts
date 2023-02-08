import { AppStoreCourse, RepeatingCustomEvent } from '../../types';
import { useScheduleStore } from '$lib/stores/schedule';

/**
 * either types of event for the generic function param below
 */
type AnyEvent = AppStoreCourse | RepeatingCustomEvent;

/**
 * After a schedule is deleted, we need to update every course and
 * custom event in every schedule. In this case, we want to update the
 * scheduleIndices array so that each event appears in the correct schedule
 *
 * @remarks
 * T is a generic function param
 * it will be inferred by whatever type you pass to the "events" param
 * the return type is inferred as T[]
 *
 * @example if you pass an array of AppStoreCourse, the return type will be inferred as AppStoreCourse[]
 */
function getEventsAfterDeleteSchedule<T extends AnyEvent>(events: T[], currentScheduleIndex: number) {
  const newEvents = [] as typeof events;

  events.forEach((event) => {
    const newScheduleIndices = [] as number[];

    event.scheduleIndices.forEach((index) => {
      if (index !== currentScheduleIndex) {
        // If a schedule gets deleted, all schedules after it are shifted back,
        // which means we sometimes need to subtract an index by 1
        newScheduleIndices.push(index > currentScheduleIndex ? index - 1 : index);
      }
    });

    if (newScheduleIndices.length > 0) {
      event.scheduleIndices = newScheduleIndices;
      newEvents.push(event);
    }
  });
  return newEvents;
}

export function useDeleteSchedule(scheduleIndex: number) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const currentScheduleIndex = useScheduleStore((state) => state.currentScheduleIndex);
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const deleteSchedule = useScheduleStore((state) => state.deleteSchedule);

  const newScheduleNames = [...scheduleNames];
  newScheduleNames.splice(scheduleIndex, 1);

  let newScheduleIndex = currentScheduleIndex;
  if (newScheduleIndex === newScheduleNames.length) {
    newScheduleIndex--;
  }

  const newAddedCourses = getEventsAfterDeleteSchedule(addedCourses, currentScheduleIndex);
  const newCustomEvents = getEventsAfterDeleteSchedule(customEvents, currentScheduleIndex);

  deleteSchedule(newScheduleNames, newAddedCourses, newCustomEvents, newScheduleIndex);
}
