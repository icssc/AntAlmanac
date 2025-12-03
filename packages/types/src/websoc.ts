import { WebsocSection, WebsocCourse, WebsocSectionType } from '@packages/anteater-api-types';

type AASectionExtendedProperties = {
    color: string;
};

export type { WebsocSectionType };

export type AASection = WebsocSection & AASectionExtendedProperties;

type AACourseExtendedProperties = {
    sections: AASection[];
    sectionTypes: Set<WebsocSectionType>;
};

export type AACourse = Omit<WebsocCourse, 'sections'> & AACourseExtendedProperties;
