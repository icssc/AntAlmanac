import { WebsocSection, WebsocCourse } from '@packages/anteater-api-types';

type AASectionExtendedProperties = {
    color: 'string';
};

export type AASection = WebsocSection & AASectionExtendedProperties;

type AACourseExtendedProperties = {
    sections: AASection[];
};

export type AACourse = WebsocCourse & AACourseExtendedProperties;
