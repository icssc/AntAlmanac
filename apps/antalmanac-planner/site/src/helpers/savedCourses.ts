import { CourseGQLData } from '../types/types';

function compareCourses(a: CourseGQLData, b: CourseGQLData): number {
  return (
    a.department.localeCompare(b.department) ||
    a.courseNumeric - b.courseNumeric ||
    a.courseNumber.localeCompare(b.courseNumber)
  );
}

export function sortSavedCourses(savedCourses: CourseGQLData[]): CourseGQLData[] {
  return savedCourses.sort(compareCourses);
}

export function getSavedCourseSortedIndex(savedCourses: CourseGQLData[], newCourse: CourseGQLData): number {
  return savedCourses.findIndex((c) => compareCourses(c, newCourse) > 0);
}
