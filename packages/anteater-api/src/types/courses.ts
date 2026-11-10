import type {
    BatchCoursesResponse,
    CourseByIdResponse,
    CoursesByFiltersResponse,
    Prereq,
    PrereqTree,
} from './generated/anteater-api-types';

export type CoursesBatchAPIResult = BatchCoursesResponse;

export type CourseByIdAPIResult = CourseByIdResponse;

export type Course = CourseByIdAPIResult['data'];

export type CoursesFilteredAPIResult = CoursesByFiltersResponse;

export type Prerequisite = Prereq;

export type PrerequisiteTree = PrereqTree;
