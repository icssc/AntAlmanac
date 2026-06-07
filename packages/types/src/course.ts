import type { WebsocCourse, WebsocSection, WebsocSectionType } from '@packages/anteater-api/types';

import { AATerm } from './calendar';

export type AASection = WebsocSection & {
    color: string;
};

export type AACourse = Omit<WebsocCourse, 'sections'> & {
    sections: AASection[];
    sectionTypes: WebsocSectionType[];
};

export type AACourseWithTerm = AACourse & {
    term: AATerm;
};
