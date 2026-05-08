import { WebsocCourse, WebsocDepartment, WebsocSection, WebsocSectionType } from '@packages/anteater-api-types';

/**
 * Course metadata as returned by WebSOC, derived directly from the API types.
 * `deptCode` comes from the parent `WebsocDepartment`; the remaining fields
 * come from `WebsocCourse`. `sectionTypes` is aggregated from the course's
 * sections rather than being a top-level field on either API type.
 */
export type CourseDetails = Pick<WebsocDepartment, 'deptCode'> &
    Pick<WebsocCourse, 'courseNumber' | 'courseTitle' | 'courseComment' | 'prerequisiteLink'> & {
        sectionTypes: WebsocSectionType[];
    };

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: WebsocSection;
}
