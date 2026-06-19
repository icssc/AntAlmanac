import type { CustomCourse, PlannerQuarterCourse } from '../types/types';

export function isCustomCourse(course: PlannerQuarterCourse): course is CustomCourse {
  return 'courseName' in course;
}
