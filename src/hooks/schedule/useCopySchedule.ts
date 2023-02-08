import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';

export function useCopySchedule(from: number, to: number) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const copySchedule = useScheduleStore((state) => state.copySchedule);

  const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
    if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
      // If to is equal to the length of scheduleNames, then the user wanted to copy to
      // all schedules; otherwise, if to is less than the length of scheduleNames, then
      // only one schedule should be altered
      if (to === scheduleNames.length) return { ...addedCourse, scheduleIndices: [...scheduleNames.keys()] };
      // this [...array.keys()] idiom is like list(range(len(array))) in python
      else
        return {
          ...addedCourse,
          scheduleIndices: addedCourse.scheduleIndices.concat(to),
        };
    } else {
      return addedCourse;
    }
  });

  const customEventsAfterCopy = customEvents.map((customEvent) => {
    if (customEvent.scheduleIndices.includes(from) && !customEvent.scheduleIndices.includes(to)) {
      if (to === scheduleNames.length) return { ...customEvent, scheduleIndices: [...scheduleNames.keys()] };
      else
        return {
          ...customEvent,
          scheduleIndices: customEvent.scheduleIndices.concat(to),
        };
    } else {
      return customEvent;
    }
  });

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
  });

  copySchedule(addedCoursesAfterCopy, customEventsAfterCopy);
}
