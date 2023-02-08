import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to change course color
 */
export default function useChangeCourseColor() {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const changeCourseColor = useScheduleStore((state) => state.changeCourseColor);

  return (sectionCode: string, newColor: string, term: string) => {
    const addedCoursesAfterColorChange = addedCourses.map((addedCourse) => {
      if (addedCourse.section.sectionCode === sectionCode && addedCourse.term === term) {
        return { ...addedCourse, color: newColor };
      } else {
        return addedCourse;
      }
    });
    changeCourseColor(addedCoursesAfterColorChange, sectionCode, newColor);
  };
}
