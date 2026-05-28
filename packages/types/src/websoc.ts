import type {
    WebsocQueryParams,
    WebsocSectionStatus,
    WebsocSectionType,
    WebsocDivisionOption,
    WebsocFullCoursesOption,
} from '@packages/anteater-api/types';
import { z } from 'zod';

import { QuarterSchema } from './calendar';

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

export const WebsocDivisionOptionSchema = z.enum([
    'LowerDiv',
    'UpperDiv',
    'Graduate',
    'ANY',
] as const satisfies readonly WebsocDivisionOption[]);

export const WebsocFullCoursesOptionSchema = z.enum([
    'ANY',
    'SkipFull',
    'SkipFullWaitlist',
    'FullOnly',
    'Overenrolled',
] as const satisfies readonly WebsocFullCoursesOption[]);

export const WebsocSearchInputSchema = z.object({
    year: z.string(),
    quarter: QuarterSchema,
    department: z.string().optional(),
    ge: z.string().optional(),
    courseNumber: z.string().optional(),
    courseTitle: z.string().optional(),
    sectionCodes: z.string().optional(),
    instructorName: z.string().optional(),
    days: z.string().optional(),
    building: z.string().optional(),
    room: z.string().optional(),
    division: WebsocDivisionOptionSchema.optional(),
    sectionType: z.string().optional(),
    fullCourses: WebsocFullCoursesOptionSchema.optional(),
    cancelledCourses: z.string().optional(),
    units: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    excludeRestrictionCodes: z.string().optional(),
    includeRelatedCourses: z.string().nullable().optional(),
}) satisfies z.ZodType<{
    [K in keyof WebsocQueryParams]: NonNullable<WebsocQueryParams[K]> extends string
        ? string | WebsocQueryParams[K]
        : WebsocQueryParams[K];
}>;
export type WebsocSearchInput = z.infer<typeof WebsocSearchInputSchema>;

export const WebsocSearchInputKeysSchema = WebsocSearchInputSchema.keyof();
