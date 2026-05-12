import { WebsocSection, WebsocCourse, WebsocSectionStatus, WebsocSectionType } from '@packages/anteater-api/types';
import { z } from 'zod';

export const WebsocSectionTypeSchema = z.enum([
    'Act',
    'Col',
    'Dis',
    'Fld',
    'Lab',
    'Lec',
    'Qiz',
    'Res',
    'Sem',
    'Stu',
    'Tap',
    'Tut',
] as const satisfies readonly WebsocSectionType[]);

export const WebsocSectionStatusSchema = z.enum([
    '',
    'OPEN',
    'Waitl',
    'FULL',
    'NewOnly',
] as const satisfies readonly WebsocSectionStatus[]);

type AASectionExtendedProperties = {
    color: string;
};

export type AASection = WebsocSection & AASectionExtendedProperties;

type AACourseExtendedProperties = {
    sections: AASection[];
    sectionTypes: WebsocSectionType[];
};

export type AACourse = Omit<WebsocCourse, 'sections'> & AACourseExtendedProperties;
