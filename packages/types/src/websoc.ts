import { QuarterSchema } from '@packages/antalmanac-types/calendar';
import type {
    WebsocSection,
    WebsocCourse,
    WebsocSectionStatus,
    WebsocSectionType,
    WebsocFullCoursesOption,
    WebsocFilterGe,
    WebsocGe,
} from '@packages/anteater-api/types';
import { WEBSOC_FILTER_GE_VALUES, WEBSOC_GE_VALUES } from '@packages/anteater-api/types';
import { z } from 'zod';

export type { WebsocFilterGe, WebsocGe };

export const WebsocGeSchema = z.enum(WEBSOC_GE_VALUES);

export const WebsocFilterGeSchema = z.enum(WEBSOC_FILTER_GE_VALUES as unknown as [WebsocFilterGe, ...WebsocFilterGe[]]);

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

export const WebsocFullCoursesOptionSchema = z.enum([
    'ANY',
    'SkipFullWaitlist',
    'SkipFull',
    'FullOnly',
    'Overenrolled',
] as const satisfies readonly WebsocFullCoursesOption[]);

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
    quarter: QuarterSchema,
    department: z.string().optional(),
    ge: z.array(WebsocFilterGeSchema).optional(),
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
});
export type WebsocSearchInput = z.infer<typeof WebsocSearchInputSchema>;

export const WebsocSearchInputKeysSchema = WebsocSearchInputSchema.keyof();
