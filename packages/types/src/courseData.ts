import type { WebsocSection, WebsocSectionType } from '@packages/anteater-api-types';

export interface CourseDetails {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
    sectionTypes: WebsocSectionType[];
}

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: WebsocSection;
}
