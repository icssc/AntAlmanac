import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to delete a course
 */
export default function useDeleteCourse() {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  let deletedCourses = useScheduleStore((state) => state.deletedCourses);
  const deleteCourse = useScheduleStore((state) => state.deleteCourse);

  return (sectionCode: string, scheduleIndex: number, term: string) => {
    const addedCoursesAfterDelete = addedCourses.filter((course) => {
      if (course.section.sectionCode === sectionCode && course.term === term) {
        deletedCourses = deletedCourses.concat({
          ...course,
          scheduleIndex,
        });
        if (course.scheduleIndices.length === 1) {
          return false;
        } else {
          course.scheduleIndices = course.scheduleIndices.filter((index) => index !== scheduleIndex);

          return true;
        }
      }
      return true;
    });

    deleteCourse(addedCoursesAfterDelete, deletedCourses);
  };
}
