import { type CourseAAPIResponse } from './course';
import { type paths } from './generated/anteater-api-types';

export type ProfessorAAPIResponse =
    paths['/v2/rest/instructors/{ucinetid}']['get']['responses'][200]['content']['application/json']['data'];

export type ProfessorPreview = CourseAAPIResponse['instructors'][number];

export type ProfessorBatchAAPIResponse = Record<string, ProfessorAAPIResponse>;
