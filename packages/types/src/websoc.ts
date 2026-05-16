import type {
    GE,
    WebsocCourse,
    WebsocSection,
    WebsocSectionStatus,
    WebsocSectionType,
} from '@packages/anteater-api/types';
import { z } from 'zod';

import { QuarterSchema } from './calendar';

/** WebSoc `ge` query values; identical to the grades API `ge` parameter (see `GradesGeSchema`). */
export const WEBSOC_GE_VALUES = [
    'ANY',
    'GE-1A',
    'GE-1B',
    'GE-2',
    'GE-3',
    'GE-4',
    'GE-5A',
    'GE-5B',
    'GE-6',
    'GE-7',
    'GE-8',
] as const satisfies readonly GE[];

export type WebsocGe = (typeof WEBSOC_GE_VALUES)[number];

export const WebsocGeSchema = z.enum(WEBSOC_GE_VALUES);

const WEBSOC_GE_SET = new Set<string>(WEBSOC_GE_VALUES);

/**
 * Single WebSoc/grades `ge` token, or a comma-separated list of tokens (manual search multi-GE).
 * Each segment must be a {@link WEBSOC_GE_VALUES} member after trimming.
 */
export const WebsocGeSearchParamSchema = z.string().refine(
    (val) => {
        const parts = val
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        return parts.length > 0 && parts.every((p) => WEBSOC_GE_SET.has(p));
    },
    { message: 'Invalid GE value' }
);

export const WEBSOC_DIVISION_VALUES = ['LowerDiv', 'UpperDiv', 'Graduate', 'ANY'] as const;

export type WebsocDivision = (typeof WEBSOC_DIVISION_VALUES)[number];

export const WebsocDivisionSchema = z.enum(WEBSOC_DIVISION_VALUES);

export const WEBSOC_FULL_COURSES_VALUES = ['ANY', 'SkipFull', 'SkipFullWaitlist', 'FullOnly', 'Overenrolled'] as const;

export type WebsocFullCourses = (typeof WEBSOC_FULL_COURSES_VALUES)[number];

export const WebsocFullCoursesSchema = z.enum(WEBSOC_FULL_COURSES_VALUES);

export const WEBSOC_CANCELLED_COURSES_VALUES = ['Exclude', 'Include', 'Only'] as const;

export type WebsocCancelledCourses = (typeof WEBSOC_CANCELLED_COURSES_VALUES)[number];

export const WebsocCancelledCoursesSchema = z.enum(WEBSOC_CANCELLED_COURSES_VALUES);

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

export const WebsocSectionTypeFilterSchema = z.union([z.literal('ANY'), WebsocSectionTypeSchema]);

export type WebsocSectionTypeFilter = z.infer<typeof WebsocSectionTypeFilterSchema>;

/** WebSoc `units` query: literal `VAR` or a free-form units string per OpenAPI. */
export const WebsocUnitsFilterSchema = z.union([z.literal('VAR'), z.string()]);

export type WebsocUnitsFilter = z.infer<typeof WebsocUnitsFilterSchema>;

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

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const WEBSOC_DIVISION_SET = new Set<string>(WEBSOC_DIVISION_VALUES);

/** Accepts WebSoc division values or `''` (form “any”); unknown strings are dropped. */
export const WebsocDivisionSearchParamSchema = z.preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'string' && WEBSOC_DIVISION_SET.has(v)) return v;
    return undefined;
}, WebsocDivisionSchema.optional());

export const WebsocSearchInputSchema = z.object({
    year: z.string(),
    quarter: QuarterSchema,
    department: z.string().optional(),
    ge: WebsocGeSearchParamSchema.optional(),
    courseNumber: z.string().optional(),
    courseTitle: z.string().optional(),
    sectionCodes: z.string().optional(),
    instructorName: z.string().optional(),
    days: z.string().optional(),
    building: z.string().optional(),
    room: z.string().optional(),
    division: WebsocDivisionSearchParamSchema,
    sectionType: emptyStringToUndefined(WebsocSectionTypeFilterSchema),
    fullCourses: WebsocFullCoursesSchema.optional(),
    cancelledCourses: emptyStringToUndefined(WebsocCancelledCoursesSchema),
    units: emptyStringToUndefined(WebsocUnitsFilterSchema),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    excludeRestrictionCodes: z.string().optional(),
    includeRelatedCourses: z.string().nullable().optional(),
});

export type WebsocSearchInput = z.infer<typeof WebsocSearchInputSchema>;
