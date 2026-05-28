import type { WebsocCourse, WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

export type AASection = WebsocSection & {
    color: string;
};

export type AACourse = Omit<WebsocCourse, 'sections'> & {
    sections: AASection[];
    sectionTypes: WebsocSectionType[];
};
