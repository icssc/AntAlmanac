import type { WebsocCourse, WebsocDepartment, WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

export interface CourseDetails extends Pick<WebsocDepartment, 'deptCode'>, WebsocCourse {
    sectionTypes: WebsocSectionType[];
}

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: WebsocSection;
}
