import type {
    WebsocData,
    WebsocDepartmentsResponse,
    WebsocResponse,
    WebsocSyllabiData,
    WebsocTermsResponse as WebsocSyllabiQueryParamsRaw,
    WebsocSyllabiResponse as WebsocSyllabiResponseRaw,
} from '$generated/anteater-api-types';

export type WebsocAPIResult = WebsocResponse;

export type WebsocAPIResponse = WebsocAPIResult['data'];

export type WebsocDepartmentsAPIResult = WebsocDepartmentsResponse;

export type WebsocAPIDepartmentsResponse = WebsocDepartmentsAPIResult['data'];

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

export type WebsocTermsAPIResult = WebsocSyllabiQueryParamsRaw;

export type WebsocTerm = WebsocTermsAPIResult['data'][number];

export type WebsocSyllabiQueryParams = WebsocSyllabiData['query'];

export type WebsocSyllabiAPIResult = WebsocSyllabiResponseRaw;

export type WebsocSyllabiResponse = WebsocSyllabiAPIResult['data'];

export type WebsocQueryParams = WebsocData['query'];

export type WebsocDivisionOption = NonNullable<WebsocQueryParams['division']>;

export type WebsocFullCoursesOption = NonNullable<WebsocQueryParams['fullCourses']>;

export type WebsocCancelledCoursesOption = NonNullable<WebsocQueryParams['cancelledCourses']>;
