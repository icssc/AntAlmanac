import { paths } from './generated/anteater-api-types';

export type DepartmentsAAPIResponse =
  paths['/v2/rest/websoc/departments']['get']['responses'][200]['content']['application/json']['data'];
