import type { InstructorByIdResponse } from '$generated/anteater-api-types';

import type { Course } from './courses';

export type ProfessorAAPIResponse = InstructorByIdResponse['data'];

export type ProfessorPreview = Course['instructors'][number];

export type ProfessorBatchAAPIResponse = Record<string, ProfessorAAPIResponse>;
