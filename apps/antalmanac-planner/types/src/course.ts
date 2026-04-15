import { components, paths } from './generated/anteater-api-types';
import { ProfessorAAPIResponse } from './professor';

export type CourseAAPIResponse =
  paths['/v2/rest/courses/{id}']['get']['responses'][200]['content']['application/json']['data'];

export type Prerequisite = components['schemas']['prereq'];

export type PrerequisiteTree = components['schemas']['prereqTree'];

export type PrerequisiteNode = Prerequisite | PrerequisiteTree;

export type CoursePreview = CourseAAPIResponse['prerequisites'][number];

export type CoursePreviewWithTerms = ProfessorAAPIResponse['courses'][number];

export type CourseBatchAAPIResponse = Record<string, CourseAAPIResponse>;
