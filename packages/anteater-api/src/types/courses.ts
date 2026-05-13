import { components, paths } from './generated/anteater-api-types';

export type CoursesBatchAPIResult =
    paths['/v2/rest/courses/batch']['get']['responses'][200]['content']['application/json'];

export type CourseByIdAPIResult =
    paths['/v2/rest/courses/{id}']['get']['responses'][200]['content']['application/json'];

export type Course = CourseByIdAPIResult['data'];

export type CoursesFilteredAPIResult =
    paths['/v2/rest/courses']['get']['responses'][200]['content']['application/json'];

export type Prerequisite = components['schemas']['prereq'];

export type PrerequisiteTree = components['schemas']['prereqTree'];
