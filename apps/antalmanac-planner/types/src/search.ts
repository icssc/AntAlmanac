import { paths } from './generated/anteater-api-types';

export type SearchAAPIResponse =
  paths['/v2/rest/search']['get']['responses'][200]['content']['application/json']['data'];
