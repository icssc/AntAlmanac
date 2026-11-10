import type { Course } from './courses';
import type { InstructorByIdResponse } from './generated/anteater-api-types';

export type ProfessorAAPIResponse = InstructorByIdResponse['data'];

export type ProfessorPreview = Course['instructors'][number];

export type ProfessorBatchAAPIResponse = Record<string, ProfessorAAPIResponse>;
