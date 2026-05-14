import type {
    WebsocSection,
    WebsocCourse,
    WebsocQueryParams,
    WebsocSectionStatus,
    WebsocSectionType,
} from '@packages/anteater-api/types';
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

export const WebsocSearchInputSchema = z.object({
    year: z.string(),
    quarter: z.string(),
    department: z.string().optional(),
    ge: z.string().optional(),
    courseNumber: z.string().optional(),
    courseTitle: z.string().optional(),
    sectionCodes: z.string().optional(),
    instructorName: z.string().optional(),
    days: z.string().optional(),
    building: z.string().optional(),
    room: z.string().optional(),
    division: z.string().optional(),
    sectionType: z.string().optional(),
    fullCourses: z.string().optional(),
    cancelledCourses: z.string().optional(),
    units: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    excludeRestrictionCodes: z.string().optional(),
    includeRelatedCourses: z.string().nullable().optional(),
}) satisfies z.ZodType<{ [K in keyof WebsocQueryParams]: unknown }>;

export type WebsocSearchInput = z.infer<typeof WebsocSearchInputSchema>;
