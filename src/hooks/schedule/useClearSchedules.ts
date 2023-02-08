import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to clear schedules
 */
export default function useClearSchedules() {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const clearSchedule = useScheduleStore((state) => state.clearSchedule);

  return (scheduleIndicesToClear: number[]) => {
    const addedCoursesAfterClear = addedCourses.filter((course) => {
      course.scheduleIndices = course.scheduleIndices.filter((index) => !scheduleIndicesToClear.includes(index));
      return course.scheduleIndices.length !== 0;
    });

    const customEventsAfterClear = customEvents.filter((customEvent) => {
      customEvent.scheduleIndices = customEvent.scheduleIndices.filter(
        (index) => !scheduleIndicesToClear.includes(index)
      );
      return customEvent.scheduleIndices.length !== 0;
    });

    clearSchedule(addedCoursesAfterClear, customEventsAfterClear);
  };
}
