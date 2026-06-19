import { useAppSelector } from '../store/hooks';
import { PlannerCourseData } from '../types/types';
import { isCustomCourse } from '../helpers/customCourses';

export const useGetCoursesInSameQuarter = (courseId: string): Set<string> => {
  const planner = useAppSelector((state) => state.roadmap.plans[state.roadmap.currentPlanIndex].content.yearPlans);

  for (const year of planner) {
    for (const quarter of year.quarters) {
      const ids = quarter.courses
        .filter((c): c is PlannerCourseData => !isCustomCourse(c))
        .map((c) => `${c.department} ${c.courseNumber}`);
      if (ids.includes(courseId)) return new Set(ids);
    }
  }

  return new Set<string>();
};
