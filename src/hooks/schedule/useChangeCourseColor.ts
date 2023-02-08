import { useScheduleStore } from '$lib/stores/schedule';

export function useChangeCourseColor(sectionCode: string, newColor: string, term: string) {
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const changeCourseColor = useScheduleStore((state) => state.changeCourseColor);

  const addedCoursesAfterColorChange = addedCourses.map((addedCourse) => {
    if (addedCourse.section.sectionCode === sectionCode && addedCourse.term === term) {
      return { ...addedCourse, color: newColor };
    } else {
      return addedCourse;
    }
  });

  changeCourseColor(addedCoursesAfterColorChange, sectionCode, newColor);
}
