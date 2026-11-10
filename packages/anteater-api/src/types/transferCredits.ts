import type { ApExamsResponse, CoursesGrantedTree } from './generated/anteater-api-types';

export type APExam = ApExamsResponse['data'][number];

export type CourseGrantedTreeItem = CoursesGrantedTree | string;
