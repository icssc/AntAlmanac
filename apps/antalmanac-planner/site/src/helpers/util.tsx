import {
  SearchIndex,
  CourseGQLData,
  ProfessorGQLData,
  BatchCourseData,
  BatchProfessorData,
  SearchType,
  CourseWithTermsLookup,
} from '../types/types';
import trpc from '../trpc';
import { CourseAAPIResponse, GETitle, ProfessorAAPIResponse } from '@peterportal/types';
import { ReactNode } from 'react';
import { useMediaQuery } from '@mui/material';

export function getCourseTags(course: CourseGQLData) {
  // data to be displayed in pills
  const tags: string[] = [];
  // units
  const { minUnits, maxUnits } = course;
  tags.push(`${minUnits === maxUnits ? maxUnits : `${minUnits}-${maxUnits}`} unit${pluralize(maxUnits)}`);
  // course level
  const courseLevel = course.courseLevel;
  if (courseLevel) {
    tags.push(`${courseLevel.substring(0, courseLevel.indexOf('('))}`);
  }
  // ge
  course.geList.forEach((ge) => {
    tags.push(`${ge.substring(0, ge.indexOf(':'))}`);
  });
  return tags;
}

// helper function to format GEs in the form of "GE: II, III"
export function formatGEsTag(geList: GETitle[]): string {
  if (geList.length === 0) return '';
  const numerals = geList.map((ge) => ge.slice(3).split(':')[0].trim());
  return `GE ${numerals.join(', ')}`;
}

// helper function to truncate course level in the form of Upper Div, Lower Div, or Grad
export function shortenCourseLevel(courseLevel: CourseGQLData['courseLevel']): string {
  return courseLevel === 'Graduate/Professional Only (200+)' ? 'Grad' : courseLevel.slice(0, 9);
}

// helper function to search 1 result from course/professor page
export async function searchAPIResult<T extends SearchType>(
  type: T,
  name: string,
): Promise<(T extends 'course' ? CourseGQLData : ProfessorGQLData) | undefined> {
  const results = await searchAPIResults(`${type}s`, [name]);
  if (Object.keys(results).length > 0) {
    return Object.values(results)[0];
  } else {
    return undefined;
  }
}

// helper function to query from API and transform to data used in redux
export async function searchAPIResults<T extends SearchIndex>(
  index: T,
  names: string[],
): Promise<T extends 'courses' ? BatchCourseData : BatchProfessorData> {
  const data =
    index === 'courses'
      ? await trpc.courses.batch.mutate({ courses: names })
      : await trpc.professors.batch.mutate({ professors: names });

  const transformed: BatchCourseData | BatchProfessorData = {};
  for (const id in data) {
    if (data[id]) {
      // use specific key based on index
      let key = '';
      if (index == 'courses') {
        key = (data[id] as CourseAAPIResponse).id;
      } else {
        key = (data[id] as ProfessorAAPIResponse).ucinetid;
      }
      // perform transformation
      transformed[key] = transformGQLData(index, data[id]);
    }
  }
  return transformed as T extends 'courses' ? BatchCourseData : BatchProfessorData;
}

export const hourMinuteTo12HourString = ({ hour, minute }: { hour: number; minute: number }) =>
  `${hour === 12 ? 12 : hour % 12}:${minute.toString().padStart(2, '0')} ${Math.floor(hour / 12) === 0 ? 'AM' : 'PM'}`;

export function transformCourseGQL(data: CourseAAPIResponse) {
  // create copy to override fields with lookups
  const course = { ...data } as unknown as CourseGQLData;
  course.instructors = Object.fromEntries(data.instructors.map((instructor) => [instructor.ucinetid, instructor]));
  course.prerequisites = Object.fromEntries(data.prerequisites.map((prerequisite) => [prerequisite.id, prerequisite]));
  /** @todo Change "dependencies" to "dependents" once it is changed in AAPI */
  course.dependents = Object.fromEntries(data.dependencies.map((dependency) => [dependency.id, dependency]));
  return course;
}

/** @todo should move transformations to backend? check performance */
// transforms PPAPI gql schema to our needs
export function transformGQLData(index: SearchIndex, data: CourseAAPIResponse | ProfessorAAPIResponse) {
  if (index == 'courses') {
    return transformCourseGQL(data as CourseAAPIResponse);
  } else {
    return transformProfessorGQL(data as ProfessorAAPIResponse);
  }
}

export function transformProfessorGQL(data: ProfessorAAPIResponse) {
  // create copy to override fields with lookups
  const professor = { ...data } as unknown as ProfessorGQLData;
  professor.courses = Object.fromEntries(data.courses.map((course) => [course.id, course]));
  return professor;
}

export function useIsMobile() {
  const isMobile = useMediaQuery('(max-width: 800px)');
  return isMobile;
}

const quartersOrdered: Record<string, string> = {
  Winter: 'a',
  Spring: 'b',
  Summer: 'c',
  Summer1: 'd',
  Summer2: 'e',
  Summer10wk: 'f',
  Fall: 'g',
};

export const sortTerms = (terms: string[]) =>
  [...new Set(terms)].sort((a, b) => {
    const [yearA, qtrA]: string[] = a.split(' ');
    const [yearB, qtrB]: string[] = b.split(' ');
    // first compare years (descending)
    // if years are equal, compare terms (most recent first)
    return yearB.localeCompare(yearA) || quartersOrdered[qtrB].localeCompare(quartersOrdered[qtrA]);
  });

export const unionTerms = (courseHistory: CourseWithTermsLookup) => {
  // get array of arrays of term names
  const allTerms = Object.values(courseHistory);

  // flatten and take union of array
  const union = allTerms.flatMap((term) => term.terms);

  return sortTerms(union);
};

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function pluralize(count: number, pluralText: string = 's', singularText: string = '') {
  return count === 1 ? singularText : pluralText;
}

export function getCourseIdWithSpaces(course: Pick<CourseGQLData, 'department'> & Pick<CourseGQLData, 'courseNumber'>) {
  return `${course.department} ${course.courseNumber}`;
}

export function addDelimiter(items: ReactNode[], between: ReactNode, last?: ReactNode) {
  const lastIdx = items.length - 1;
  last ??= between;
  return items.flatMap((item, idx) => {
    if (idx === lastIdx) return [item];
    return [item, idx === lastIdx - 1 ? last : between];
  });
}

export function checkModalOpen() {
  return !!document.querySelector('body > :is(.MuiModal-root)');
}
