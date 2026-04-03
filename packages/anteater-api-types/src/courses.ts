import { components, paths } from './generated/anteater-api-types';

export type CourseByIdAPIResult =
    paths['/v2/rest/courses/{id}']['get']['responses'][200]['content']['application/json'];

export type Course = CourseByIdAPIResult['data'];

export type Prerequisite = components['schemas']['prereq'];

export type PrerequisiteTree = components['schemas']['prereqTree'];
