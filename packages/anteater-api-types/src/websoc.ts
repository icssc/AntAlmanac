import { paths } from './generated/anteater-api-types';

export type WebsocAPIResponse =
    paths['/v2/rest/websoc']['get']['responses'][200]['content']['application/json']['data'];

export type WebsocCourse = WebsocAPIResponse['schools'][number]['departments'][number]['courses'][number];

export type WebsocSection = WebsocCourse['sections'][number];

export type WebsocSectionMeeting = WebsocSection['meetings'][number];

export type WebsocSectionFinalExam = WebsocSection['finalExam'];

export type HourMinute = Extract<WebsocSection['finalExam'], { examStatus: 'SCHEDULED_FINAL' }>['startTime'];
