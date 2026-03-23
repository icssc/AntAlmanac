'use client';
import { useCallback, useEffect } from 'react';
import trpc from '../trpc';
import { CourseGQLData } from '../types/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSavedCourses, saveCourseInState, unsaveCourseInState } from '../store/slices/savedCoursesSlice';
import { useIsLoggedIn } from './isLoggedIn';
import { sortSavedCourses } from '../helpers/savedCourses';
import { searchAPIResults } from '../helpers/util';

export function useSavedCourses() {
  const savedCourses = useAppSelector((state) => state.savedCourses.savedCourses);
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!savedCourses) return;
    localStorage.setItem('coursebag', JSON.stringify(savedCourses.map((course) => course.id)));
  }, [savedCourses]);

  const saveCourse = useCallback(
    (course: CourseGQLData) => {
      dispatch(saveCourseInState(course));
      if (isLoggedIn) trpc.savedCourses.add.mutate({ courseId: course.id });
    },
    [dispatch, isLoggedIn],
  );

  const unsaveCourse = useCallback(
    (course: CourseGQLData) => {
      dispatch(unsaveCourseInState(course));
      if (isLoggedIn) trpc.savedCourses.remove.mutate({ courseId: course.id });
    },
    [dispatch, isLoggedIn],
  );

  const isCourseSaved = useCallback(
    (course: CourseGQLData): boolean => {
      if (!savedCourses) return false;
      return savedCourses.some((c) => c.id === course.id);
    },
    [savedCourses],
  );

  const toggleSavedCourse = useCallback(
    (course: CourseGQLData) => {
      isCourseSaved(course) ? unsaveCourse(course) : saveCourse(course);
    },
    [saveCourse, unsaveCourse, isCourseSaved],
  );

  return {
    savedCourses: savedCourses ?? [],
    saveCourse,
    unsaveCourse,
    isCourseSaved,
    toggleSavedCourse,
  };
}

async function getSavedCourses(isLoggedIn: boolean) {
  if (isLoggedIn) {
    return await trpc.savedCourses.get.query();
  }
  try {
    return JSON.parse(localStorage.getItem('coursebag') ?? '[]');
  } catch {
    return [];
  }
}

export function useLoadSavedCourses() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();

  const loadSavedCourses = useCallback(async () => {
    const courseIds = await getSavedCourses(isLoggedIn);
    const savedCourseData = await searchAPIResults('courses', courseIds);
    const savedCourses = sortSavedCourses(Object.values(savedCourseData));
    dispatch(setSavedCourses(savedCourses));
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    loadSavedCourses();
  }, [loadSavedCourses]);
}
