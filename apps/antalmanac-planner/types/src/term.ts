import { paths } from './generated/anteater-api-types';

export type TermResponse =
  paths['/v2/rest/websoc/terms']['get']['responses']['200']['content']['application/json']['data'];
