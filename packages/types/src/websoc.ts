import type {
    WebsocCancelledCoursesOption,
    WebsocDivisionOption,
    WebsocFullCoursesOption,
    WebsocQueryParams,
    WebsocSectionStatus,
    WebsocSectionType,
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

export const WebsocCancelledCoursesOptionSchema = z.enum([
    'Exclude',
    'Include',
    'Only',
] as const satisfies readonly WebsocCancelledCoursesOption[]);

/** UCI WebSoc restriction codes (https://www.reg.uci.edu/enrollment/restrict_codes.html). */
export const WEBSOC_RESTRICTION_CODES = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'R',
    'S',
    'X',
] as const;
export const WebsocRestrictionCodeOptionSchema = z.enum(WEBSOC_RESTRICTION_CODES);
export type WebsocRestrictionCodeOption = z.infer<typeof WebsocRestrictionCodeOptionSchema>;

/** UCI WebSoc day abbreviations (Su, M, Tu, W, Th, F, Sa). */
export const WEBSOC_DAYS = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'] as const;
export const WebsocDayOptionSchema = z.enum(WEBSOC_DAYS);
export type WebsocDayOption = z.infer<typeof WebsocDayOptionSchema>;

/**
 * UCI GE (General Education) category codes. Excludes the API's `'ANY'` sentinel:
 * "no GE filter" is modeled as an empty selection rather than a magic value.
 */
export const WEBSOC_GE_OPTIONS = [
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
] as const satisfies readonly Exclude<NonNullable<WebsocQueryParams['ge']>, 'ANY'>[];
export const WebsocGeOptionSchema = z.enum(WEBSOC_GE_OPTIONS);
export type WebsocGeOption = z.infer<typeof WebsocGeOptionSchema>;

export const WebsocSearchInputSchema = z.object({
    year: z.string(),
    quarter: QuarterSchema,
    department: z.string().optional(),
    ge: z.string().optional(),
    courseNumber: z.string().optional(),
    courseId: z.string().optional(),
    courseTitle: z.string().optional(),
    sectionCodes: z.string().optional(),
    instructorName: z.string().optional(),
    days: z.array(WebsocDayOptionSchema).default([]),
    building: z.string().optional(),
    room: z.string().optional(),
    division: WebsocDivisionOptionSchema.optional(),
    sectionType: z.string().optional(),
    fullCourses: WebsocFullCoursesOptionSchema.optional(),
    cancelledCourses: WebsocCancelledCoursesOptionSchema.optional(),
    units: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    excludeRestrictionCodes: z.array(WebsocRestrictionCodeOptionSchema).default([]),
    includeRelatedCourses: z.string().nullable().optional(),
}) satisfies z.ZodType<
    Omit<
        {
            [K in keyof WebsocQueryParams]: NonNullable<WebsocQueryParams[K]> extends string
                ? string | WebsocQueryParams[K]
                : WebsocQueryParams[K];
        },
        'excludeRestrictionCodes' | 'days'
    > & {
        excludeRestrictionCodes?: WebsocRestrictionCodeOption[];
        days?: WebsocDayOption[];
    }
>;
export type WebsocSearchInput = z.infer<typeof WebsocSearchInputSchema>;

export const WebsocSearchInputKeysSchema = WebsocSearchInputSchema.keyof();
