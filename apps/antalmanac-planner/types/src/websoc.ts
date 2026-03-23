import { paths } from './generated/anteater-api-types';

export type WebsocAPIResponse =
  paths['/v2/rest/websoc']['get']['responses']['200']['content']['application/json']['data'];

export type WebsocSection =
  WebsocAPIResponse['schools'][number]['departments'][number]['courses'][number]['sections'][number];
