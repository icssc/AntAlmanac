import { WebsocSection, WebsocSectionType } from '@packages/anteater-api-types';

export interface CourseDetails {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
    sectionTypes: Set<WebsocSectionType>;
}

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: WebsocSection;
}
