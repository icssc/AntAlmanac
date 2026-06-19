import {
  CourseAAPIResponse,
  CoursePreview,
  CoursePreviewWithTerms,
  ProfessorAAPIResponse,
  ProfessorPreview,
  QuarterName,
} from '@peterportal/types';

export * from './roadmap.ts';

export interface ScoreData {
  name: string;
  avgRating: number;
  /** course id or ucinetid */
  id: string;
}
export type SearchIndex = 'courses' | 'instructors';
export type SearchType = 'course' | 'instructor';

/**
 * Peter's Roadmaps Type Definitions
 */
export type PlannerData = PlannerYearData[];

export interface PlannerYearData {
  startYear: number;
  name: string;
  quarters: PlannerQuarterData[];
  collapsed: boolean;
}

export interface PlannerQuarterData {
  name: QuarterName;
  courses: PlannerQuarterCourse[];
}

export interface PlannerCourseData extends CourseGQLData {
  userChosenUnits?: number;
}

export type PlannerQuarterCourse = PlannerCourseData | CustomCourse;

/** @todo delete these identifier traits once everything is in revision */
// Specify the location of a year
export interface YearIdentifier {
  yearIndex: number;
}

// Specify the location of a quarter
export interface QuarterIdentifier extends YearIdentifier {
  quarterIndex: number;
}

// Specify the location of a course
export interface CourseIdentifier extends QuarterIdentifier {
  courseIndex: number;
}

// Specify where the invalid course is and what courses it needs to take
export interface InvalidCourseData {
  location: CourseIdentifier;
  required: string[];
}

export interface ProfessorLookup {
  [ucinetid: string]: ProfessorPreview;
}

export interface CourseLookup {
  [courseid: string]: CoursePreview;
}

export type CourseWithTermsLookup = Record<string, CoursePreviewWithTerms>;

export type CourseGQLData = Omit<CourseAAPIResponse, 'instructors' | 'prerequisites' | 'dependencies'> & {
  instructors: ProfessorLookup;
  prerequisites: CourseLookup;
  dependents: CourseLookup;
};

export interface BatchCourseData {
  [courseid: string]: CourseGQLData;
}

export type ProfessorGQLData = Omit<ProfessorAAPIResponse, 'courses'> & {
  courses: CourseWithTermsLookup;
};

export interface BatchProfessorData {
  [ucinetid: string]: ProfessorGQLData;
}

export type SearchResultData = CourseGQLData[] | ProfessorGQLData[];

export interface CustomCourse {
  id: number;
  courseName: string;
  units: number;
  description: string;
}
