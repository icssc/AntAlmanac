import type { CourseInSchedule } from '@packages/db/src/schema/schedule/course';
import type { Schedule as ScheduleRow } from '@packages/db/src/schema/schedule/schedule';
import { z } from 'zod';

import { CourseDetails } from './courseData';
import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customEvent';
import { AASection } from './websoc';

/** Max length for schedule notes (UI and server validation). */
export const SCHEDULE_NOTE_MAX_LENGTH = 5000;

/**
 * Hydrated in-memory representation of a course. Derived from {@link CourseDetails}
 * (which itself derives from `WebsocCourse`) plus the section, term, and
 * the `color` added by {@link AASection}.
 */
export type ScheduleCourse = CourseDetails & {
    section: AASection;
    term: string;
};

/**
 * Full in-memory schedule held by the client. Not a DB type —
 * it aggregates normalized DB data with WebSOC-fetched course details.
 */
export type Schedule = {
    scheduleName: string;
    courses: ScheduleCourse[];
    customEvents: RepeatingCustomEvent[];
    /** Key into the scheduleNoteMap; never persisted directly. */
    scheduleNoteId: number;
    scheduleId: string;
};

/**
 * Wire-format course. Picks the three columns persisted in `coursesInSchedule`.
 * The `satisfies` constraint is a compile-time guard: if those DB column names
 * or types change, this object literal will fail to type-check.
 */
export const ShortCourseSchema = z.object({
    sectionCode: z.number().int(),
    term: z.string(),
    color: z.string(),
} satisfies { [K in keyof Pick<CourseInSchedule, 'sectionCode' | 'term' | 'color'>]: z.ZodType<CourseInSchedule[K]> });
export type ShortCourse = z.infer<typeof ShortCourseSchema>;

/**
 * Wire-format schedule. The `id`, `name`, and `notes` keys directly mirror
 * the `schedules` table columns; the `satisfies` constraint enforces this.
 * `courses` and `customEvents` hold the related rows in flattened form.
 */
export const ShortCourseScheduleSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    notes: z.string().max(SCHEDULE_NOTE_MAX_LENGTH).optional().default(''),
    courses: z.array(ShortCourseSchema),
    customEvents: z.array(RepeatingCustomEventSchema),
} satisfies {
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodType<NonNullable<ScheduleRow['name']>>;
    notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    courses: z.ZodArray<typeof ShortCourseSchema>;
    customEvents: z.ZodArray<typeof RepeatingCustomEventSchema>;
});
export type ShortCourseSchedule = z.infer<typeof ShortCourseScheduleSchema>;

export const ScheduleSaveStateSchema = z.object({
    schedules: z.array(ShortCourseScheduleSchema),
    scheduleIndex: z.number(),
});
export type ScheduleSaveState = z.infer<typeof ScheduleSaveStateSchema>;

export type ScheduleUndoState = {
    schedules: Schedule[];
    scheduleIndex: number;
};
