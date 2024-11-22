import { components, paths } from './generated/anteater-api-types';

export type Course = paths['/v2/rest/courses/{id}']['get']['responses'][200]['content']['application/json']['data'];

export type Prerequisite = components['schemas']['prereq'];

export type PrerequisiteTree = components['schemas']['prereqTree'];
