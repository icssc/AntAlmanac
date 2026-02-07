import { paths } from './generated/anteater-api-types';

export type WebsocAPIResponse =
    paths['/v2/rest/websoc']['get']['responses'][200]['content']['application/json']['data'];

export type WebsocSchool = WebsocAPIResponse['schools'][number];

export type WebsocDepartment = WebsocSchool['departments'][number];

export type WebsocCourse = WebsocDepartment['courses'][number];

export type WebsocSection = WebsocCourse['sections'][number];

export type WebsocSectionEnrollment = WebsocSection['numCurrentlyEnrolled'];

export type WebsocSectionMeeting = WebsocSection['meetings'][number];

export type WebsocSectionFinalExam = WebsocSection['finalExam'];

export type HourMinute = Extract<WebsocSection['finalExam'], { examStatus: 'SCHEDULED_FINAL' }>['startTime'];

export type WebsocSectionType = WebsocCourse['sections'][number]['sectionType'];

export type WebsocSectionStatus = WebsocCourse['sections'][number]['status'];

export type WebsocTerm =
    paths['/v2/rest/websoc/terms']['get']['responses'][200]['content']['application/json']['data'][number];
