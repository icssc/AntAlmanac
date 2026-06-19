import { CourseGQLData } from '../types/types';
import { LOADING_COURSE_PLACEHOLDER as defaultData } from './courseRequirements';
import { sortSavedCourses } from './savedCourses';

describe('sortSavedCourses', () => {
  it('correctly sorts two different departments', () => {
    const courseA: CourseGQLData = {
      ...defaultData,
      department: 'COMPSCI',
    };
    const courseB: CourseGQLData = {
      ...defaultData,
      department: 'BIOSCI',
    };
    expect(sortSavedCourses([courseA, courseB])).toEqual([courseB, courseA]);
  });
  it('correctly sorts courses with different numbers', () => {
    const courseA: CourseGQLData = {
      ...defaultData,
      courseNumber: '31',
      courseNumeric: 31,
    };
    const courseB: CourseGQLData = {
      ...defaultData,
      courseNumber: '32',
      courseNumeric: 32,
    };
    expect(sortSavedCourses([courseA, courseB])).toEqual([courseA, courseB]);
  });
  it('correctly sorts courses with prefixed letters', () => {
    const courseA: CourseGQLData = {
      ...defaultData,
      courseNumber: 'H32',
      courseNumeric: 32,
    };
    const courseB: CourseGQLData = {
      ...defaultData,
      courseNumber: '32',
      courseNumeric: 32,
    };
    const courseC: CourseGQLData = {
      ...defaultData,
      courseNumber: '31',
      courseNumeric: 31,
    };
    expect(sortSavedCourses([courseA, courseB, courseC])).toEqual([courseC, courseB, courseA]);
  });
});
