import { paths } from './generated/anteater-api-types';

type _Course = paths['/v2/rest/courses/{id}']['get']['responses'][200]['content']['application/json']['data'];

type CoursePrerequisite = {
    prereqType: 'course';
    coreq: false;
    courseId: string;
    minGrade?: string;
};

type CourseCorequisite = {
    prereqType: 'course';
    coreq: true;
    courseId: string;
};

type ExamPrerequisite = {
    prereqType: 'exam';
    examName: string;
    minGrade?: string;
};

export type Prerequisite = CoursePrerequisite | CourseCorequisite | ExamPrerequisite;

export type PrerequisiteTree = {
    AND?: Array<Prerequisite | PrerequisiteTree>;
    OR?: Array<Prerequisite | PrerequisiteTree>;
    NOT?: Array<Prerequisite | PrerequisiteTree>;
};

export interface Course extends _Course {
    prerequisiteTree: PrerequisiteTree;
}
