import { type paths } from './generated/anteater-api-types';

export type CourseMaterialsAAPIResponse =
    paths['/v2/rest/courseMaterials']['get']['responses'][200]['content']['application/json']['data'];
