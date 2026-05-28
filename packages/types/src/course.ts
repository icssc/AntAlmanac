import type { WebsocCourse, WebsocDepartment, WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

export type AASection = WebsocSection & {
    color: string;
};

export type AACourse = Pick<WebsocDepartment, 'deptCode'> &
    Omit<WebsocCourse, 'sections'> & {
        sections: AASection[];
        sectionTypes: WebsocSectionType[];
    };
