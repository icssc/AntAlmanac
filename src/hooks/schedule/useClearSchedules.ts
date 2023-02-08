import { useScheduleStore } from '$lib/stores/schedule';

export function useClearSchedules(scheduleIndicesToClear: number[]) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const clearSchedule = useScheduleStore((state) => state.clearSchedule);

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
}
