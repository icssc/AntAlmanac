import { WebsocSectionType } from '@packages/anteater-api-types';
import { z } from 'zod';

import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customEvent';
import { AASection } from './websoc';

/** Max length for schedule notes (UI and server validation). */
export const SCHEDULE_NOTE_MAX_LENGTH = 5000;

export type ScheduleCourse = {
    courseComment: string;
    courseNumber: string;
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
    section: AASection;
    term: string;
    sectionTypes: WebsocSectionType[];
};

export type Schedule = {
    scheduleName: string;
    courses: ScheduleCourse[];
    customEvents: RepeatingCustomEvent[];
    scheduleNoteId: number;
    scheduleId: string;
};

export const ShortCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    /**
     * Matches the integer `sectionCode` column in `coursesInSchedule`.
     * The WebSOC API returns section codes as strings; convert with parseInt/String at the boundary.
     */
    sectionCode: z.number().int(),
});
export type ShortCourse = z.infer<typeof ShortCourseSchema>;

export const ShortCourseScheduleSchema = z
    .object({
        /**
         * Matches the `name` column in the `schedules` table.
         */
        name: z.string(),
        courses: z.array(ShortCourseSchema),
        customEvents: z.array(RepeatingCustomEventSchema),
        /**
         * Matches the `notes` column in the `schedules` table.
         */
        notes: z.string().max(SCHEDULE_NOTE_MAX_LENGTH).optional(),
        id: z.string().optional(),
    })
    .transform((schedule) => ({ notes: '', ...schedule }));
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
