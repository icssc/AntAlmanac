import { Course, Prerequisite, PrerequisiteTree } from '@packages/anteater-api/types';

import { ProfessorAAPIResponse } from './professor';

export type CourseAAPIResponse = Course;

export type { Prerequisite, PrerequisiteTree };

export type PrerequisiteNode = Prerequisite | PrerequisiteTree;

export type CoursePreview = CourseAAPIResponse['prerequisites'][number];

export type CoursePreviewWithTerms = ProfessorAAPIResponse['courses'][number];

export type CourseBatchAAPIResponse = Record<string, CourseAAPIResponse>;
